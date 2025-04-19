import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, Book, UserCircle, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LecturerBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navigationItems = [
    { 
      icon: Calendar, 
      label: 'Dashboard', 
      path: '/lecturer/dashboard',
    },
    { 
      icon: Book, 
      label: 'Units', 
      path: '/lecturer/units',
    },
    { 
      icon: ClipboardList, 
      label: 'Planner', 
      path: '/lecturer/planner',
    },
    { 
      icon: Users, 
      label: 'Students', 
      path: '/lecturer/students',
    },
    { 
      icon: UserCircle, 
      label: 'Profile', 
      path: '/lecturer/profile',
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800/50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-around py-3">
          {navigationItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 group ${
                location.pathname.includes(item.path) ? 'text-blue-500' : ''
              }`}
            >
              <item.icon 
                className={`transition-all duration-300 transform group-hover:scale-110 
                  ${location.pathname.includes(item.path) 
                    ? 'text-blue-500' 
                    : 'text-gray-400 group-hover:text-white'
                  }`} 
                size={24} 
              />
              <span className={`text-xs ${
                location.pathname.includes(item.path)
                  ? 'text-blue-500'
                  : 'text-gray-400 group-hover:text-white'
              } transition-colors duration-300`}>
                {item.label}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LecturerBottomNav; 