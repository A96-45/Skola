import apiClient from './ApiClient';

// Define user interface
export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'lecturer';
  university_id?: string;
  university_name?: string;
  course_id?: string;
  year?: string;
  created_at?: string;
  updated_at?: string;
}

// Empty service (authentication functionality removed)
const AuthService = {
  // Placeholder dummy user for student role
  getDummyStudent: (): User => {
    return {
      id: 'student-1',
      full_name: 'Demo Student',
      email: 'student@example.com',
      role: 'student',
      university_id: 'uni-1',
      university_name: 'University of Technology',
      year: '2'
    };
  },
  
  // Placeholder dummy user for lecturer role
  getDummyLecturer: (): User => {
    return {
      id: 'lecturer-1',
      full_name: 'Demo Lecturer',
      email: 'lecturer@example.com',
      role: 'lecturer',
      university_id: 'uni-1',
      university_name: 'University of Technology'
    };
  }
};

export default AuthService; 