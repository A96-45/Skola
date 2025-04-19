import { supabase } from '@/lib/supabase';
import { NotificationData } from '@/types/websocket';
import { sendNotification as dbSendNotification } from '@/services/DatabaseService';
import { toast } from 'sonner';
import { getSocket } from './socketUtils';

export const setupNotificationsListener = (userId: string, setNotifications: React.Dispatch<React.SetStateAction<any[]>>) => {
  // Listen for real-time notifications from the socket
  const socket = getSocket();
  
  socket.on('notification', (notification: any) => {
    if (notification.recipients.includes(userId)) {
      setNotifications(prev => [
        {
          ...notification,
          timestamp: new Date()
        },
        ...prev
      ]);
      
      toast(notification.title, {
        description: notification.message
      });
    }
  });
  
  // Also keep the Supabase listener as a backup/alternative
  return supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_id=eq.${userId}`
    }, (payload) => {
      const newNotification = payload.new;
      
      setNotifications(prev => [
        {
          ...newNotification,
          timestamp: new Date(newNotification.created_at)
        },
        ...prev
      ]);
      
      toast(newNotification.title, {
        description: newNotification.message
      });
    });
};

export const sendNotificationUtil = async (userId: string, notification: NotificationData) => {
  if (!userId) return;
  
  try {
    const { recipients, ...notificationData } = notification;
    
    // Send notification to socket server
    const socket = getSocket();
    socket.emit('sendNotification', {
      ...notification,
      sender: userId
    });
    
    // Also store in database via Supabase
    if (recipients && recipients.length > 0) {
      for (const recipientId of recipients) {
        await dbSendNotification({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          sender_id: userId,
          recipient_id: recipientId,
          course_id: notification.courseId,
          university_id: notification.universityId || userId || '',
          read: false
        });
      }
      
      toast.success(`Notification sent to ${recipients.length} recipients`);
    } 
    else if (notification.courseId) {
      await dbSendNotification({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        sender_id: userId,
        course_id: notification.courseId,
        university_id: notification.universityId || userId || '',
        read: false
      });
      
      toast.success("Course-wide notification sent");
    } 
    else if (notification.universityId || userId) {
      await dbSendNotification({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        sender_id: userId,
        university_id: notification.universityId || userId || '',
        read: false
      });
      
      toast.success("University-wide notification sent");
    }
  } catch (err) {
    console.error("Error sending notification:", err);
    toast.error("Failed to send notification");
  }
};
