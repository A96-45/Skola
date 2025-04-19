import { useState, useEffect } from 'react';
import { AuthService } from '@/services/ApiService';

const TestAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setIsLoggedIn(true);
        setUser(currentUser);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await AuthService.signIn('student@example.com', 'password123');
      setUser(userData);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await AuthService.signUp({
        email: 'newstudent@example.com',
        password: 'password123',
        full_name: 'New Student',
        role: 'student'
      });
      setUser(userData);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AuthService.signOut();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="mb-4">
        <p className="mb-2">Status: {isLoggedIn ? 'Logged In' : 'Logged Out'}</p>
        
        {loading && <p className="text-gray-500">Loading...</p>}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {user && (
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h2 className="font-bold">User Info:</h2>
            <pre className="mt-2 bg-gray-200 p-2 rounded text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        {!isLoggedIn ? (
          <>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
              disabled={loading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Signup
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default TestAuth; 