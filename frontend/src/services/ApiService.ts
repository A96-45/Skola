import { University as ImportedUniversity } from '@/lib/mockData';

// Define a simplified University type for our local use
interface University {
  id: string;
  name: string;
  location?: string;
  created_at?: string;
}

// Extended User type
export interface ExtendedUser {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'lecturer';
  university_id?: string;
  university_name?: string;
  course_id?: string;
  year?: string;
  teaching_units?: Array<{
    university: string;
    unit: string;
    enrollment_key: string;
  }>;
}

// Mock API client (replacing real backend)
const mockApiClient = {
  // Mock storage
  _users: new Map<string, ExtendedUser>(),
  _authToken: '',

  get: async (url: string) => {
    console.log(`Mock API GET: ${url}`);
    // Simulate a response delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock different endpoints
    if (url === '/users/me') {
      const userData = localStorage.getItem('mockUser');
      if (userData) {
        return { data: JSON.parse(userData) };
      }
      throw new Error('Not authenticated');
    }
    
    // Return empty data for other endpoints
    return { data: {} };
  },
  
  post: async (url: string, data: any) => {
    console.log(`Mock API POST: ${url}`, data);
    // Simulate a response delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock login endpoint
    if (url === '/login') {
      const { email, password } = data;
      if (email === 'demo@example.com' && password === 'password') {
        const mockUser: ExtendedUser = {
          id: '1',
          full_name: 'Demo User',
          email: 'demo@example.com',
          role: 'student'
        };
        
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        localStorage.setItem('authToken', 'mock-token-123');
        
        return {
          data: {
            user: mockUser,
            access_token: 'mock-token-123'
          }
        };
      }
      throw new Error('Invalid email or password');
    }
    
    // Default response for other endpoints
    return { data: { success: true } };
  },
  
  patch: async (url: string, data: any) => {
    console.log(`Mock API PATCH: ${url}`, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (url === '/users/me') {
      const userData = localStorage.getItem('mockUser');
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = { ...user, ...data };
        localStorage.setItem('mockUser', JSON.stringify(updatedUser));
        return { data: updatedUser };
      }
    }
    
    return { data: {} };
  },
  
  delete: async (url: string, config?: any) => {
    console.log(`Mock API DELETE: ${url}`, config);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: { success: true } };
  }
};

// Use the mock API client
const apiClient = mockApiClient;

// Authentication Services
export const AuthService = {
  // Sign in existing user
  signIn: async (email: string, password: string): Promise<ExtendedUser> => {
    try {
      const response = await apiClient.post('/login', { email, password });
      
      // Store the token
      if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
      }
      
      // Make sure user data exists
      if (!response.data.user) {
        throw new Error('Invalid response format: missing user data');
      }
      
      return response.data.user;
    } catch (error: any) {
      console.error('Error during signin:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('mockUser');
  },

  // Get current user profile
  getCurrentUser: async (): Promise<ExtendedUser | null> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  // Update user profile
  updateUser: async (userId: string, updates: Partial<ExtendedUser>): Promise<ExtendedUser> => {
    try {
      const response = await apiClient.patch(`/users/me`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Mock data for services
  addTeachingCourse: async (userId: string, unitCode: string, universityId: string): Promise<{ enrollment_key: string }> => {
    return { enrollment_key: `MOCK-${unitCode}-${Date.now().toString(36)}` };
  },

  removeTeachingCourse: async (): Promise<void> => {},
  
  getTeachingCourses: async (): Promise<any> => {
    return { data: [] };
  },
  
  enrollInCourse: async (): Promise<void> => {},
  
  unenrollFromCourse: async (): Promise<void> => {},
  
  generateLecturerKey: async (): Promise<{ lecturer_key: string }> => {
    return { lecturer_key: `MOCK-LECTURER-${Date.now().toString(36)}` };
  },
  
  linkToLecturer: async (): Promise<void> => {},
  
  connectStudent: async (): Promise<void> => {},
  
  validateStudent: async (): Promise<boolean> => {
    return true;
  },
  
  addUnit: async (): Promise<void> => {},
  
  updateUnit: async (): Promise<void> => {},
  
  addStudentUnit: async (): Promise<void> => {},
  
  sendNotes: async (): Promise<void> => {},
  
  getNotes: async (): Promise<any[]> => {
    return [];
  },
  
  getUnits: async (): Promise<any[]> => {
    return [];
  },
  
  getStudents: async (): Promise<any[]> => {
    return [];
  },
  
  deleteUnit: async (): Promise<void> => {},
  
  getCourses: async (): Promise<any[]> => {
    return [];
  },
  
  getCourse: async (): Promise<any> => {
    return {};
  },
  
  updateCourse: async (): Promise<void> => {},
  
  createCourse: async (): Promise<void> => {},
  
  deleteCourse: async (): Promise<void> => {}
};

// Mock university services
export const UniversityService = {
  getById: async (id: string): Promise<University> => {
    return {
      id,
      name: `University ${id}`,
      location: 'Mock Location'
    };
  },
  
  search: async (query: string): Promise<University[]> => {
    return [
      { id: '1', name: 'Mock University 1' },
      { id: '2', name: 'Mock University 2' },
      { id: '3', name: 'Mock University 3' }
    ].filter(u => u.name.toLowerCase().includes(query.toLowerCase()));
  }
};

export default mockApiClient;
