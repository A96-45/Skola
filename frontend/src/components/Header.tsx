import React, { useState, useEffect } from 'react';
import { Bell, Target, CreditCard, BookOpen, MessageCircle, User as UserIcon, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';

export interface HeaderProps {
  title?: string;
  backButton?: boolean;
  backPath?: string;
  titleClassName?: string;
}

export function Header({
  title = "Skola",
  backButton = false,
  backPath,
  titleClassName = '',
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // For demo purposes, set a random number of notifications
    setNotificationsCount(Math.floor(Math.random() * 5));

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="flex items-center gap-4 py-6">
      {backButton && (
        <Button
          variant="ghost"
          size="icon"
          className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
          onClick={() => {
            if (backPath) {
              navigate(backPath);
            } else {
              navigate(-1);
            }
          }}
        >
          <ChevronLeft size={18} />
          <span className="sr-only">Back</span>
        </Button>
      )}
      {title && (
        <h1 className={`text-2xl font-semibold ${titleClassName}`}>
          {title}
        </h1>
      )}
    </div>
  );
}

export default Header; 