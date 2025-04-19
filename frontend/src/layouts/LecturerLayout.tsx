import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import LecturerBottomNav from '@/components/lecturer/LecturerBottomNav';

const LecturerLayout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname.includes('/signup') || location.pathname.includes('/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Outlet />
      {!isAuthPage && <LecturerBottomNav />}
    </div>
  );
};

export default LecturerLayout; 