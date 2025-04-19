
export type NotificationType = 'announcement' | 'assignment' | 'grade' | 'document' | 'message';

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  universityId?: string;
  courseId?: string;
  recipients: string[]; // Array of student IDs
}

export interface DocumentData {
  type: string;
  title: string;
  content: string;
  courseId: string;
  sender: string;
  universityId?: string;
  recipients: string[]; // Array of student IDs
  description?: string;
  documentName?: string;
  timestamp?: Date;
  fromUserId?: string;
  fromUserName?: string;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
}

export interface WebSocketContextType {
  isConnected: boolean;
  messages: Message[];
  notifications: any[];
  sendMessage: (to: string, text: string) => void;
  sendNotification: (notification: NotificationData) => void;
  sendDocument: (document: DocumentData) => void;
  clearNotifications: () => void;
  joinUniversityCourse: (universityId: string, courseCode: string) => void;
}
