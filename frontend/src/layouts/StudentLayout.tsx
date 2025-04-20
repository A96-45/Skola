import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const StudentLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
};

export default StudentLayout; 