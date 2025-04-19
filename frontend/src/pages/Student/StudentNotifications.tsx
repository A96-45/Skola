import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Header } from '@/components/Header';
import BottomNav from '../../components/BottomNav';
import Notification from '../../components/Notification';
import { Bell, CheckCircle, SlidersHorizontal, Inbox, FileText, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'resource' | 'announcement' | 'reminder';
  priority?: 'high' | 'medium' | 'low';
  time: string;
  timestamp: Date;
  read: boolean;
  courseId?: string;
  courseCode?: string;
  resourceId?: string;
  assignmentId?: string;
  universityId?: string;
}

const StudentNotifications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'assignment' | 'resource' | 'announcement'>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      setTimeout(() => {
        setNotifications([
          {
            id: '1',
            title: 'New Assignment Posted',
            message: 'Introduction to Variables and Data Types assignment has been posted. Due next Friday.',
            type: 'assignment',
            priority: 'high',
            time: '10 minutes ago',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            read: false,
            courseId: '1',
            courseCode: 'CS101',
            assignmentId: 'a1',
            universityId: user?.university_id
          },
          {
            id: '2',
            title: 'New Resource Available',
            message: 'Week 2 lecture slides on Control Structures are now available.',
            type: 'resource',
            priority: 'medium',
            time: '2 hours ago',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            read: true,
            courseId: '1',
            courseCode: 'CS101',
            resourceId: 'r2',
            universityId: user?.university_id
          },
          {
            id: '3',
            title: 'Class Reminder',
            message: 'Your Introduction to Programming class will start in 30 minutes in Room 204.',
            type: 'reminder',
            priority: 'high',
            time: '30 minutes ago',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            read: false,
            courseId: '1',
            courseCode: 'CS101',
            universityId: user?.university_id
          },
          {
            id: '4',
            title: 'Class Announcement',
            message: 'Tomorrow\'s lecture will be held online due to campus maintenance. Check your email for the link.',
            type: 'announcement',
            priority: 'medium',
            time: '1 day ago',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            read: true,
            courseId: '1',
            courseCode: 'CS101',
            universityId: user?.university_id
          },
          {
            id: '5',
            title: 'Assignment Deadline Extended',
            message: 'The deadline for Control Structures Assignment has been extended by two days.',
            type: 'assignment',
            priority: 'low',
            time: '3 days ago',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            read: true,
            courseId: '1',
            courseCode: 'CS101',
            assignmentId: 'a2',
            universityId: user?.university_id
          }
        ]);
        setLoading(false);
      }, 1000);
    };
    
    fetchNotifications();
  }, [user?.university_id]);

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(
      notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    
    if (notification.type === 'assignment' && notification.courseId && notification.assignmentId) {
      navigate(`/student/course/${notification.courseId}?tab=assignments&highlight=${notification.assignmentId}`);
    } else if (notification.type === 'resource' && notification.courseId && notification.resourceId) {
      navigate(`/student/course/${notification.courseId}?tab=resources&highlight=${notification.resourceId}`);
    } else if ((notification.type === 'announcement' || notification.type === 'reminder') && notification.courseId) {
      navigate(`/student/course/${notification.courseId}`);
    }
    
    toast({
      title: "Notification marked as read",
      description: "You'll be redirected to the related content"
    });
  };
  
  const markAllAsRead = () => {
    setNotifications(
      notifications.map(n => ({ ...n, read: true }))
    );
    
    toast({
      title: "Success",
      description: "All notifications marked as read"
    });
  };
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'assignment' || filter === 'resource' || filter === 'announcement') {
      return notification.type === filter;
    }
    return true;
  });
  
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1, undefined: 0 };
    const priorityA = priorityOrder[a.priority || 'undefined'];
    const priorityB = priorityOrder[b.priority || 'undefined'];
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white pb-20">
      <Header />
      
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <Bell className="mr-2 text-indigo-400" /> Notifications
          </h1>
          
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            className="text-sm"
            disabled={!notifications.some(n => !n.read)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>
        
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {[
              { value: 'all', label: 'All', icon: Inbox },
              { value: 'unread', label: 'Unread', icon: Bell },
              { value: 'assignment', label: 'Assignments', icon: FileText },
              { value: 'resource', label: 'Resources', icon: Book },
              { value: 'announcement', label: 'Announcements', icon: SlidersHorizontal }
            ].map((item) => (
              <Button
                key={item.value}
                variant={filter === item.value ? 'default' : 'secondary'}
                onClick={() => setFilter(item.value as any)}
                className="whitespace-nowrap"
              >
                <item.icon className="mr-2 h-4 w-4" /> {item.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          {sortedNotifications.length > 0 ? (
            sortedNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Notification 
                  {...notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-gray-800/30 backdrop-blur-lg rounded-lg">
              <Bell className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300">No Notifications</h3>
              <p className="text-gray-500 mt-2">
                {filter === 'all' 
                  ? "You're all caught up!" 
                  : `No ${filter} notifications found`}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default StudentNotifications;
