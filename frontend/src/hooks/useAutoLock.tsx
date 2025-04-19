
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useAutoLock = (timeout = 1800000) => { // Default 30 minutes
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    let timer: number;
    
    const resetTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (user) {
          logout();
          navigate('/');
        }
      }, timeout);
    };
    
    // Set up events to reset the timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });
    
    // Initial setup
    resetTimer();
    
    // Cleanup
    return () => {
      if (timer) window.clearTimeout(timer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [user, logout, navigate, timeout]);
};

export default useAutoLock;
