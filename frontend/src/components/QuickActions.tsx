import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, CreditCard, BookOpen, MessageCircle } from 'lucide-react';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  path: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, color, path }) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(path)}
      className={`${color} flex flex-col items-center justify-center p-4 rounded-md transition-all`}
    >
      <div className="mb-2">
        {React.cloneElement(icon as React.ReactElement, { 
          className: 'w-6 h-6',
          strokeWidth: 2
        })}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

const QuickActions: React.FC = () => {
  const actions = [
    { 
      icon: <Target />, 
      label: 'Attendance', 
      color: 'bg-teal-950 text-teal-400', 
      path: '/student/attendance' 
    },
    { 
      icon: <CreditCard />, 
      label: 'Fee Payment', 
      color: 'bg-purple-950 text-purple-400', 
      path: '/student/fee-payment' 
    },
    { 
      icon: <BookOpen />, 
      label: 'Assignments', 
      color: 'bg-amber-950 text-amber-400', 
      path: '/student/assignments' 
    },
    { 
      icon: <MessageCircle />, 
      label: 'Chat Support', 
      color: 'bg-blue-950 text-blue-400', 
      path: '/student/chatbot' 
    }
  ];
  
  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((action, index) => (
        <QuickAction key={index} {...action} />
      ))}
    </div>
  );
};

export default QuickActions;