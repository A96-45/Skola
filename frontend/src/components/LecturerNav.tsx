import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, Users, User } from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, active }) => {
  const navigate = useNavigate();
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(to)}
      className="flex flex-col items-center"
    >
      <div className={`p-2 ${active ? 'text-purple-400' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className={`text-xs ${active ? 'text-purple-400' : 'text-gray-400'}`}>{label}</span>
    </motion.button>
  );
};

const LecturerNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navItems = [
    { icon: <Home className="w-6 h-6" />, label: 'Home', to: '/lecturer/dashboard' },
    { icon: <BookOpen className="w-6 h-6" />, label: 'Classes', to: '/lecturer/classes' },
    { icon: <Users className="w-6 h-6" />, label: 'Students', to: '/lecturer/students' },
    { icon: <User className="w-6 h-6" />, label: 'Profile', to: '/lecturer/profile' },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-lg border-t border-gray-800">
      <div className="flex justify-around items-center p-3">
        {navItems.map((item, index) => (
          <NavItem 
            key={index} 
            {...item} 
            active={currentPath === item.to} 
          />
        ))}
      </div>
    </div>
  );
};

export default LecturerNav; 