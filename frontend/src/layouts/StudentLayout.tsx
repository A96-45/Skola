import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const StudentLayout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname.includes('/signup') || location.pathname.includes('/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white pb-20">
      <Outlet />
      {!isAuthPage && <BottomNav />}
    </div>
  );
};

export default StudentLayout; 