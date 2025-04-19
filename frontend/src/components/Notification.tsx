
import React from 'react';
import { Bell, Book, FileText, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'resource' | 'announcement' | 'reminder';
  priority?: 'high' | 'medium' | 'low';
  time: string;
  read: boolean;
  courseCode?: string;
  onClick?: () => void;
}

const Notification = ({ 
  title, 
  message, 
  type, 
  priority,
  time, 
  read, 
  courseCode, 
  onClick 
}: NotificationProps) => {
  const getIcon = () => {
    switch (type) {
      case 'assignment':
        return <FileText className="text-blue-400" size={18} />;
      case 'resource':
        return <Book className="text-green-400" size={18} />;
      case 'announcement':
        return <Bell className="text-purple-400" size={18} />;
      case 'reminder':
        return <Calendar className="text-amber-400" size={18} />;
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return "border-red-500 text-red-400";
      case 'medium':
        return "border-amber-500 text-amber-400";
      case 'low':
        return "border-blue-500 text-blue-400";
      default:
        return "border-gray-500 text-gray-400";
    }
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg transition-colors cursor-pointer",
        read ? "bg-gray-800/30" : "bg-blue-900/20 border-l-2 border-blue-500",
        "hover:bg-gray-700/40"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="bg-gray-700/50 p-2 rounded-lg">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-white flex items-center gap-2">
              {title}
              {priority && (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor()}`}>
                  {priority}
                </span>
              )}
            </h3>
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2 flex items-center">
              <Clock size={12} className="mr-1" /> {time}
            </span>
          </div>
          {courseCode && (
            <div className="text-sm text-blue-400 font-medium mt-0.5">{courseCode}</div>
          )}
          <p className="text-sm text-gray-300 mt-1 line-clamp-2">{message}</p>
        </div>
        {!read && (
          <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-2"></div>
        )}
      </div>
    </div>
  );
};

export default Notification;
