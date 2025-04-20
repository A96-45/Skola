import React from 'react';
import { University } from '../data/universities';

interface UniversityCardProps {
  university: University;
  selected?: boolean;
  onClick?: () => void;
}

const UniversityCard: React.FC<UniversityCardProps> = ({ university, selected = false, onClick }) => {
  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
        ${selected 
          ? 'border-blue-500 bg-blue-500/20' 
          : 'border-zinc-700 hover:border-blue-500/50 hover:bg-zinc-800/50'
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 flex-shrink-0">
          <img
            src={university.image}
            alt={university.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white truncate">
            {university.name}
          </h3>
          <p className="text-xs text-zinc-400 truncate">
            {university.id}
          </p>
        </div>
      </div>
      {selected && (
        <div className="absolute top-2 right-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityCard;
