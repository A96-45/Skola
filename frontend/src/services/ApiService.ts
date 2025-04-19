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
    
    // Mock signup endpoints
    if (url.includes('/signup')) {
      const mockUser: ExtendedUser = {
        id: Math.random().toString(36).substring(2, 15),
        full_name: data.fullName || 'New User',
        email: data.email,
        role: url.includes('lecturer') ? 'lecturer' : 'student',
        university_id: data.universityId
      };
      
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock-token-' + mockUser.id);
      
      return {
        data: {
          user: mockUser,
          token: 'mock-token-' + mockUser.id
        }
      };
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
  // Register a new user
  signUp: async (userData: {
    email: string;
    password: string;
    full_name: string;
    role: 'student' | 'lecturer';
    university_id?: string;
    universityUnits?: Array<{ university_name: string; unit_code: string; unit_name: string }>;
  }): Promise<ExtendedUser> => {
    try {
      const endpoint = userData.role === 'lecturer' ? '/lecturers/signup' : '/students/signup';
      
      const payload = {
        email: userData.email,
        password: userData.password,
        fullName: userData.full_name,
        universityId: userData.university_id,
        ...(userData.role === 'lecturer' && userData.universityUnits ? {
          universityUnits: userData.universityUnits.map(unit => ({
            universityId: unit.university_name,
            unitCode: unit.unit_code,
            unitName: unit.unit_name
          }))
        } : {})
      };

      const response = await apiClient.post(endpoint, payload);
        
      // Store the token if it's provided
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
        
      return response.data.user;
    } catch (error: any) {
      console.error('Error during signup:', error);
      throw error;
    }
  },

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
