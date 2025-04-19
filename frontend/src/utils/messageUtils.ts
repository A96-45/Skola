import { supabase } from '@/lib/supabase';
import { Message } from '@/types/websocket';
import { sendMessage as dbSendMessage } from '@/services/DatabaseService';
import { toast } from 'sonner';
import { getSocket } from './socketUtils';

export const setupMessagesListener = (userId: string, setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
  // Listen for real-time messages from the socket
  const socket = getSocket();
  
  socket.on('message', (newMessage: Message) => {
    if (newMessage.to === userId) {
      setMessages(prev => [...prev, newMessage]);
      
      toast("New message received", {
        description: `${newMessage.text.substring(0, 30)}${newMessage.text.length > 30 ? '...' : ''}`
      });
    }
  });
  
  // Also keep the Supabase listener as a backup/alternative
  return supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `recipient_id=eq.${userId}`
    }, (payload) => {
      const newMessage = payload.new;
      
      const formattedMessage: Message = {
        id: newMessage.id,
        from: newMessage.sender_id,
        to: newMessage.recipient_id,
        text: newMessage.content,
        timestamp: new Date(newMessage.created_at).getTime()
      };
      
      setMessages(prev => [...prev, formattedMessage]);
      
      toast("New message received", {
        description: `${newMessage.content.substring(0, 30)}${newMessage.content.length > 30 ? '...' : ''}`
      });
    });
};

export const sendMessageUtil = async (
  userId: string, 
  to: string, 
  text: string, 
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  if (!userId) return;
  
  try {
    // Send message to socket server
    const socket = getSocket();
    const socketMessage = {
      from: userId,
      to,
      text,
      timestamp: Date.now()
    };
    
    socket.emit('sendMessage', socketMessage);
    
    // Also store in database via Supabase
    const messageData = {
      sender_id: userId,
      recipient_id: to,
      content: text,
      read: false,
      university_id: userId || '',
      course_id: userId || undefined
    };
    
    const newMessage = await dbSendMessage(messageData);
    
    const formattedMessage: Message = {
      id: newMessage.id,
      from: userId,
      to,
      text,
      timestamp: new Date(newMessage.created_at).getTime()
    };
    
    setMessages(prev => [...prev, formattedMessage]);
    console.log("Message sent:", formattedMessage);
    
    return formattedMessage;
  } catch (err) {
    console.error("Error sending message:", err);
    toast.error("Failed to send message");
  }
};
