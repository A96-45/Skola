import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Message, DocumentData as Document } from '@/types/websocket';
import * as MockDB from '@/services/MockDatabaseService';

interface WebSocketContextType {
  sendMessage: (recipientId: string, content: string) => Promise<void>;
  shareDocument: (title: string, content: string, recipients: string[]) => Promise<void>;
  messages: Message[];
  documents: Document[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth() || { user: null };
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const userMessages = await MockDB.getMessages(user.id);
          const userDocuments = await MockDB.getDocuments(user.id);
          setMessages(userMessages);
          setDocuments(userDocuments);
        } catch (error) {
          console.error('Error loading messages and documents:', error);
          setMessages([]);
          setDocuments([]);
        }
      } else {
        setMessages([]);
        setDocuments([]);
      }
    };

    loadData();
  }, [user]);

  // Simulate real-time updates every 5 seconds
  useEffect(() => {
    if (!user) {
      setMessages([]);
      setDocuments([]);
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updatedMessages = await MockDB.getMessages(user.id);
        const updatedDocuments = await MockDB.getDocuments(user.id);
        setMessages(updatedMessages);
        setDocuments(updatedDocuments);
      } catch (error) {
        console.error('Error updating messages and documents:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const sendMessage = async (recipientId: string, content: string) => {
    if (!user) throw new Error('No user logged in');

    const newMessage = await MockDB.sendMessage(user.id, recipientId, content);
    setMessages(prev => [...prev, newMessage]);
  };

  const shareDocument = async (title: string, content: string, recipients: string[]) => {
    if (!user) throw new Error('No user logged in');

    const newDocument = await MockDB.shareDocument(user.id, title, content, recipients);
    setDocuments(prev => [...prev, newDocument]);
  };

  return (
    <WebSocketContext.Provider value={{
      sendMessage,
      shareDocument,
      messages,
      documents,
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
