
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  background?: string;
  progressColor?: string;
  showValue?: boolean;
  valueClassName?: string;
  children?: React.ReactNode;
}

export const ProgressCircle = ({
  value,
  max = 100,
  size = 36,
  strokeWidth = 3,
  className,
  background = '#27272a',
  progressColor,
  showValue = true,
  valueClassName,
  children
}: ProgressCircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(0, value), max); // Clamp value between 0 and max
  const percentage = (progress / max) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on percentage
  const getDefaultColor = () => {
    if (percentage >= 75) return '#10b981'; // green
    if (percentage >= 50) return '#f59e0b'; // amber
    if (percentage >= 25) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={background}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor || getDefaultColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      
      {showValue && !children && (
        <div className={cn("absolute inset-0 flex items-center justify-center text-xs font-medium", valueClassName)}>
          {Math.round(percentage)}%
        </div>
      )}
      
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};
