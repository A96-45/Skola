import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, School } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { setActiveRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleStudentSelect = () => {
    setActiveRole('student');
    navigate('/student/dashboard');
  };

  const handleLecturerSelect = () => {
    setActiveRole('lecturer');
    navigate('/lecturer/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        {/* Banter Loader */}
        <div className="banter-loader">
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
          <div className="banter-loader__box"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-6xl mx-auto relative">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-violet-500/20 rounded-full -top-24 -left-24 md:-top-48 md:-left-48 blur-3xl animate-pulse" />
          <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-blue-500/20 rounded-full top-1/2 right-0 blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="text-center space-y-8 relative">
          {/* Logo/Icon */}
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center animate-float">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>

          {/* Title and Description */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-500 animate-gradient">
              Welcome to Skola
            </h1>
            <p className="text-lg text-zinc-400">Your educational platform</p>
          </div>

          {/* Interface Selection */}
          <div className="flex flex-col md:flex-row gap-6 justify-center max-w-5xl mx-auto mt-8 px-4">
            <button
              onClick={handleStudentSelect}
              className="group relative flex-1 p-8 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-xl border border-zinc-700/50
                transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0
                hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] max-w-md backdrop-blur-sm"
            >
              <div className="relative flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-blue-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold">Student Interface</h3>
                  <p className="text-sm text-zinc-400">
                    Access your courses and learning materials
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={handleLecturerSelect}
              className="group relative flex-1 p-8 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-xl border border-zinc-700/50
                transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0
                hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] max-w-md backdrop-blur-sm"
            >
              <div className="relative flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center">
                  <School className="w-10 h-10 text-violet-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold">Lecturer Interface</h3>
                  <p className="text-sm text-zinc-400">
                    Manage your classes and resources
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
