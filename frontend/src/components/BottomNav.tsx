import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Book, User, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/student/dashboard'
    },
    {
      icon: FileText,
      label: 'Notes',
      path: '/student/courses'
    },
    {
      icon: Calendar,
      label: 'Planner',
      path: '/student/planner'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/student/profile'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full",
                  "transition-colors duration-200",
                  isActive 
                    ? "text-blue-400 font-medium" 
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 mb-1",
                  isActive ? "text-blue-400" : "text-zinc-400"
                )} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
