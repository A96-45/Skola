import React from 'react';

interface ProgressDotProps {
  active: boolean;
  completed: boolean;
}

const ProgressDot: React.FC<ProgressDotProps> = ({ active, completed }) => {
  return (
    <div
      className={`
        w-3 h-3 rounded-full transition-all duration-300
        ${completed 
          ? 'bg-gradient-to-r from-blue-500 to-violet-500 scale-100'
          : active
            ? 'bg-blue-500 scale-110'
            : 'bg-zinc-700 scale-100'
        }
      `}
    />
  );
};

export default ProgressDot; 