import { User, mockUsers } from '@/lib/mockData';
import { Message, DocumentData as Document } from '@/types/websocket';
import { University } from '@/lib/mockData';

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock data for messages and documents
const mockMessages: Message[] = [];
const mockDocuments: Document[] = [];

// Types for our mock entities
export interface MockUser {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'lecturer';
  university_id?: string;
  enrollment_key?: string;
}

export interface MockUnit {
  id: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
  image_url?: string;
}

export interface MockTeachingUnit {
  id: string;
  lecturer_id: string;
  unit_id: string;
  university_id: string;
  enrollment_key?: string;
  progress?: number;
  schedule?: string;
}

export interface MockEnrollment {
  id: string;
  student_id: string;
  teaching_unit_id: string;
}

export interface MockNote {
  id: string;
  lecturer_id: string;
  unit_id: string;
  content: string;
  timestamp: string;
}

export interface MockCourse {
  id: string;
  code: string;
  title: string;
  instructor?: string;
  description?: string;
  progress?: number;
  next_class?: string;
  students_count?: number;
  has_notifications?: boolean;
  image_url?: string;
  color?: string;
  studentId: string;
}

// Define our own University type since we don't know the exact structure
export interface MockUniversity {
  id: string;
  name: string;
}

// Mock database with initial data
export class MockDatabase {
  private static instance: MockDatabase;
  
  public users: MockUser[] = [
    {
      id: '1',
      full_name: 'John Doe',
      email: 'john@example.com',
      role: 'lecturer',
      university_id: 'UNI001',
      enrollment_key: 'LEC12345'
    },
    {
      id: '2',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'student',
      university_id: 'UNI001'
    }
  ];
  
  public universities: MockUniversity[] = [
    { id: 'UNI001', name: 'University of Technology' },
    { id: 'UNI002', name: 'State University' },
    { id: 'UNI003', name: 'Coastal College' }
  ];
  
  public units: MockUnit[] = [
    {
      id: '1',
      code: 'CS101',
      name: 'Introduction to Programming',
      description: 'Learn the basics of programming using Python',
      color: 'bg-blue-500',
      image_url: 'https://via.placeholder.com/150'
    },
    {
      id: '2',
      code: 'MATH201',
      name: 'Calculus I',
      description: 'Introduction to differential and integral calculus',
      color: 'bg-green-500',
      image_url: 'https://via.placeholder.com/150'
    }
  ];
  
  public teachingUnits: MockTeachingUnit[] = [
    {
      id: '1',
      lecturer_id: '1',
      unit_id: '1',
      university_id: 'UNI001',
      enrollment_key: 'CS101KEY',
      progress: 30,
      schedule: 'Mon/Wed 10:00-11:30'
    }
  ];
  
  public enrollments: MockEnrollment[] = [
    {
      id: '1',
      student_id: '2',
      teaching_unit_id: '1'
    }
  ];
  
  public notes: MockNote[] = [
    {
      id: '1',
      lecturer_id: '1',
      unit_id: '1',
      content: 'Today we covered variables and basic data types.',
      timestamp: new Date().toISOString()
    }
  ];
  
  public courses: MockCourse[] = [
    {
      id: '1',
      code: 'CS101',
      title: 'Introduction to Programming',
      instructor: 'John Doe',
      description: 'Learn the basics of programming using Python',
      progress: 30,
      next_class: 'Monday 10:00 AM',
      students_count: 45,
      has_notifications: true,
      image_url: 'https://via.placeholder.com/150',
      color: 'bg-blue-500',
      studentId: '2'
    }
  ];
  
  // Singleton pattern to ensure we have only one database instance
  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }
  
  // Helper methods for data manipulation
  public findUserByEmail(email: string): MockUser | undefined {
    return this.users.find(user => user.email === email);
  }
  
  public findUserById(id: string): MockUser | undefined {
    return this.users.find(user => user.id === id);
  }
  
  public addUser(user: Omit<MockUser, 'id'>): MockUser {
    const newId = (this.users.length + 1).toString();
    const newUser = { ...user, id: newId };
    this.users.push(newUser);
    return newUser;
  }
  
  public getCoursesByStudentId(studentId: string): MockCourse[] {
    return this.courses.filter(course => course.studentId === studentId);
  }
  
  public getUnitsByLecturerId(lecturerId: string): any[] {
    const teachingUnitIds = this.teachingUnits
      .filter(tu => tu.lecturer_id === lecturerId)
      .map(tu => ({ id: tu.id, unitId: tu.unit_id }));
      
    return teachingUnitIds.map(({ id, unitId }) => {
      const unit = this.units.find(u => u.id === unitId);
      const teachingUnit = this.teachingUnits.find(tu => tu.id === id);
      
      if (!unit || !teachingUnit) return null;
      
      return {
        id,
        code: unit.code,
        name: unit.name,
        description: unit.description,
        color: unit.color,
        image_url: unit.image_url,
        progress: teachingUnit.progress,
        schedule: teachingUnit.schedule,
        enrollment_key: teachingUnit.enrollment_key
      };
    }).filter(Boolean);
  }
}

// Export a singleton instance
export const mockDatabase = MockDatabase.getInstance();

// User Management
export const getUser = async (userId: string): Promise<User | null> => {
  const user = mockUsers.find(u => u.id === userId);
  return user || null;
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) throw new Error('User not found');
  
  mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
  return mockUsers[userIndex];
};

// Authentication (Mock)
export const signIn = async (email: string, password: string): Promise<User> => {
  const user = mockUsers.find(u => u.email === email);
  if (!user) throw new Error('Invalid credentials');
  return user;
};

export const signOut = async (): Promise<void> => {
  // Mock sign out - nothing to do
  return;
};

// Message and Document Management
export const getMessages = async (userId: string): Promise<Message[]> => {
  return mockMessages.filter(m => m.to === userId || m.from === userId);
};

export const getDocuments = async (userId: string): Promise<Document[]> => {
  return mockDocuments.filter(d => d.recipients.includes(userId));
};

export const sendMessage = async (fromId: string, toId: string, content: string): Promise<Message> => {
  const newMessage: Message = {
    id: generateId(),
    from: fromId,
    to: toId,
    text: content,
    timestamp: Date.now()
  };
  mockMessages.push(newMessage);
  return newMessage;
};

export const shareDocument = async (fromId: string, title: string, content: string, recipients: string[]): Promise<Document> => {
  const newDocument: Document = {
    type: 'document',
    title,
    content,
    courseId: '',
    sender: fromId,
    recipients,
    timestamp: new Date()
  };
  mockDocuments.push(newDocument);
  return newDocument;
};