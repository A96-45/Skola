import React, { createContext, useContext, useState } from 'react';
import AuthService, { User } from '@/services/AuthService';

interface AuthContextType {
  user: User | null;
  setActiveRole: (role: 'student' | 'lecturer') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Set the active role (student or lecturer)
  const setActiveRole = (role: 'student' | 'lecturer') => {
    if (role === 'student') {
      setUser(AuthService.getDummyStudent());
    } else {
      setUser(AuthService.getDummyLecturer());
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setActiveRole
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