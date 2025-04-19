
import React from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineItemProps {
  text: string;
  time: string;
  status: 'upcoming' | 'past' | 'urgent';
}

const TimelineItem: React.FC<TimelineItemProps> = ({ text, time, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'urgent': return 'bg-red-500';
      case 'past': return 'bg-gray-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'urgent': return 'text-red-500 border-red-500';
      case 'past': return 'text-gray-500 border-gray-500';
      default: return 'text-green-500 border-green-500';
    }
  };

  return (
    <motion.div 
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 p-3 rounded-lg"
    >
      <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${status === 'urgent' ? 'animate-pulse' : ''}`}></div>
      <div className="flex-1">
        <p className="font-medium">{text}</p>
      </div>
      <div className={`px-3 py-1 border rounded-md text-sm ${getStatusText()}`}>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {time}
        </span>
      </div>
    </motion.div>
  );
};

export default TimelineItem;
