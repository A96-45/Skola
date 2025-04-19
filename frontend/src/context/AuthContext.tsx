import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, ExtendedUser } from '@/services/ApiService';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<ExtendedUser>;
  signOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    role: 'student' | 'lecturer',
    university?: string,
    universityUnits?: Array<{ university_name: string; unit_code: string; unit_name: string }>,
    name?: string
  ) => Promise<void>;
  updateUserProfile: (updates: Partial<ExtendedUser>) => Promise<void>;
  addTeachingCourse: (unitCode: string, universityId: string) => Promise<{ enrollment_key: string }>;
  removeTeachingCourse: (unitCode: string, universityId: string) => Promise<void>;
  getTeachingCourses: () => Promise<any>; // Updated return type to match grouped students
  enrollInCourse: (enrollmentKey: string) => Promise<void>;
  unenrollFromCourse: (unitCode: string, universityId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    // Try to load user from localStorage first for immediate state update
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (e) {
      console.error('Error loading user from localStorage:', e);
    }
    
    if (token) {
      AuthService.getCurrentUser()
        .then((user) => {
          if (user) {
            setUser(user);
            // Store user in localStorage for offline access
            localStorage.setItem('currentUser', JSON.stringify(user));
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
          }
        })
        .catch((error) => {
          console.error('Error getting current user:', error);
          // Don't clear stored user on network errors
          if (error.message !== 'Network Error') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      localStorage.removeItem('currentUser');
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await AuthService.signIn(email, password);
      setUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      toast({
        title: "Success",
        description: "Signed in successfully",
      });
      return user;
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await AuthService.signOut();
      setUser(null);
      localStorage.removeItem('currentUser');
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    } catch (error: any) {
      setError(error.message || 'Failed to sign out');
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: 'student' | 'lecturer',
    university?: string,
    universityUnits?: Array<{ university_name: string; unit_code: string; unit_name: string }>,
    name?: string
  ) => {
    try {
      setLoading(true);
      const user = await AuthService.signUp({
        email,
        password,
        full_name: name || email.split('@')[0], // Use provided name or fallback to email
        role,
        university_id: university,
        universityUnits,
      });
      setUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    } catch (error: any) {
      setError(error.message || 'Failed to sign up');
      toast({
        title: "Error",
        description: error.message || "Failed to sign up",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<ExtendedUser>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setLoading(true);
      const updatedUser = await AuthService.updateUser(user.id, updates);
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addTeachingCourse = async (unitCode: string, universityId: string) => {
    if (!user) throw new Error('No user logged in');
    if (user.role !== 'lecturer') throw new Error('Only lecturers can add teaching courses');
    
    try {
      setLoading(true);
      const result = await AuthService.addTeachingCourse(user.id, unitCode, universityId);
      toast({
        title: "Success",
        description: "Teaching course added successfully",
      });
      return result;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add teaching course",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTeachingCourse = async (unitCode: string, universityId: string) => {
    if (!user) throw new Error('No user logged in');
    if (user.role !== 'lecturer') throw new Error('Only lecturers can remove teaching courses');
    
    try {
      setLoading(true);
      await AuthService.removeTeachingCourse(user.id, unitCode, universityId);
      toast({
        title: "Success",
        description: "Teaching course removed successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to remove teaching course",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTeachingCourses = async () => {
    if (!user) throw new Error('No user logged in');
    if (user.role !== 'lecturer') throw new Error('Only lecturers can view teaching courses');
    
    try {
      setLoading(true);
      const courses = await AuthService.getTeachingCourses(user.id);
      return courses; // Returns grouped students (e.g., {"CS101 - UnivA": ["Student1"]})
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to get teaching courses",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (enrollmentKey: string) => {
    if (!user) throw new Error('No user logged in');
    if (user.role !== 'student') throw new Error('Only students can enroll in courses');
    
    try {
      setLoading(true);
      await AuthService.enrollInCourse(enrollmentKey, user.id); // Pass user.id as studentId
      toast({
        title: "Success",
        description: "Enrolled in course successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to enroll in course",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unenrollFromCourse = async (unitCode: string, universityId: string) => {
    if (!user) throw new Error('No user logged in');
    if (user.role !== 'student') throw new Error('Only students can unenroll from courses');
    
    try {
      setLoading(true);
      await AuthService.unenrollFromCourse(unitCode, universityId);
      toast({
        title: "Success",
        description: "Unenrolled from course successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to unenroll from course",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signOut,
        signUp,
        updateUserProfile,
        addTeachingCourse,
        removeTeachingCourse,
        getTeachingCourses,
        enrollInCourse,
        unenrollFromCourse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};