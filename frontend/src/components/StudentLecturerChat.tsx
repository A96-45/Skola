
import React, { useState, useEffect } from 'react';
import { Send, PaperclipIcon, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/context/WebSocketContext';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  timestamp: Date;
  read: boolean;
}

interface ChatProps {
  recipientId?: string;
  recipientName?: string;
  courseId?: string;
}

const StudentLecturerChat: React.FC<ChatProps> = ({ 
  recipientId, 
  recipientName = "Chat",
  courseId 
}) => {
  const { user } = useAuth();
  const { isConnected, sendMessage } = useWebSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState<{ id: string, name: string }>({
    id: recipientId || '',
    name: recipientName
  });

  useEffect(() => {
    if (!user || !recipientId) return;

    // Get recipient info if not provided
    const getRecipientInfo = async () => {
      if (!recipientName && recipientId) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('name')
            .eq('id', recipientId)
            .single();
            
          if (error) throw error;
          
          setRecipientInfo({
            id: recipientId,
            name: data.name
          });
        } catch (err) {
          console.error("Error fetching recipient info:", err);
        }
      } else {
        setRecipientInfo({
          id: recipientId || '',
          name: recipientName
        });
      }
    };
    
    getRecipientInfo();

    // Fetch conversation history
    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        // Get messages sent by the user to the recipient
        const { data: sentMessages, error: sentError } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            read,
            sender_id,
            users:sender_id (name)
          `)
          .eq('sender_id', user.id)
          .eq('recipient_id', recipientId)
          .order('created_at', { ascending: true });
          
        if (sentError) throw sentError;
        
        // Get messages received by the user from the recipient
        const { data: receivedMessages, error: receivedError } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            read,
            sender_id,
            users:sender_id (name)
          `)
          .eq('sender_id', recipientId)
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: true });
          
        if (receivedError) throw receivedError;
        
        // Combine and sort messages
        const allMessages = [
          ...(sentMessages || []).map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.sender_id,
            senderName: user.name,
            recipientId: recipientId,
            timestamp: new Date(msg.created_at),
            read: msg.read
          })),
          ...(receivedMessages || []).map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.sender_id,
            senderName: msg.users?.name || recipientName,
            recipientId: user.id,
            timestamp: new Date(msg.created_at),
            read: msg.read
          }))
        ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        setMessages(allMessages);
        
        // Mark unread messages as read
        const unreadMessageIds = receivedMessages
          ?.filter((msg: any) => !msg.read)
          .map((msg: any) => msg.id);
          
        if (unreadMessageIds && unreadMessageIds.length > 0) {
          await supabase
            .from('messages')
            .update({ read: true })
            .in('id', unreadMessageIds);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel('chat-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`
      }, async (payload) => {
        const newMsg = payload.new;
        
        // Only add message if it's from the current chat partner
        if (newMsg.sender_id === recipientId) {
          try {
            // Get sender name
            const { data, error } = await supabase
              .from('users')
              .select('name')
              .eq('id', newMsg.sender_id)
              .single();
              
            if (error) throw error;
            
            const formattedMessage: Message = {
              id: newMsg.id,
              content: newMsg.content,
              senderId: newMsg.sender_id,
              senderName: data.name,
              recipientId: newMsg.recipient_id,
              timestamp: new Date(newMsg.created_at),
              read: false
            };
            
            setMessages(prev => [...prev, formattedMessage]);
            
            // Mark as read
            await supabase
              .from('messages')
              .update({ read: true })
              .eq('id', newMsg.id);
          } catch (err) {
            console.error("Error processing new message:", err);
          }
        }
      })
      .subscribe();
      
    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [user, recipientId, recipientName]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !recipientId) return;
    
    setLoading(true);
    
    try {
      // Store message in database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: newMessage,
          read: false,
          course_id: courseId,
          university_id: user.university_id || ''
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add to local state
      const message: Message = {
        id: data.id,
        content: newMessage,
        senderId: user.id,
        senderName: user.name,
        recipientId: recipientId,
        timestamp: new Date(data.created_at),
        read: false
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const isMyMessage = (senderId: string) => {
    return user?.id === senderId;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg overflow-hidden">
      <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">{recipientInfo.name}</h3>
            <div className="text-xs text-gray-500">
              {courseId ? `Course: ${courseId}` : ''}
              {isConnected ? 
                <span className="text-green-600 ml-2">● Online</span> : 
                <span className="text-gray-400 ml-2">● Offline</span>
              }
            </div>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4 bg-gray-50/30">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${isMyMessage(message.senderId) ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isMyMessage(message.senderId)
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <div className="text-sm mb-1">{message.content}</div>
                    <div className="text-xs text-right opacity-70">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-800 rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-3 border-t flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full"
          type="button"
        >
          <PaperclipIcon className="h-4 w-4" />
        </Button>
        
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-md"
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        
        <Button 
          variant="default" 
          size="icon"
          disabled={!newMessage.trim() || loading}
          onClick={handleSendMessage}
          className="rounded-full"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StudentLecturerChat;
