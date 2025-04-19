import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface NavigationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isBack?: boolean;
  children: React.ReactNode;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ onClick, disabled = false, isBack = false, children }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`
      group flex items-center justify-center gap-2 px-6 py-3 w-full
      rounded-lg text-sm font-medium transition-all duration-300 shadow-lg
      ${isBack 
        ? 'bg-zinc-800 text-white border-2 border-zinc-700' 
        : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-blue-500/30'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : 'transform hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-1 active:translate-y-0'}
    `}
  >
    {isBack && <ArrowLeft className="w-5 h-5 transition-transform" />}
    <span>{children}</span>
    {!isBack && <ArrowRight className="w-5 h-5 transition-transform" />}
  </button>
);

export default NavigationButton; 