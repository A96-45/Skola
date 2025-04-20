import React from 'react';
import { Outlet } from 'react-router-dom';
import LecturerBottomNav from '@/components/lecturer/LecturerBottomNav';

const LecturerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white pb-20">
      <Outlet />
      <LecturerBottomNav />
    </div>
  );
};

export default LecturerLayout; 