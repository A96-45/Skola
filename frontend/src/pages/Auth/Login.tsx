import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock, User, GraduationCap, School } from 'lucide-react';

// NavigationButton component for reuse
const NavigationButton = ({
  isBack = false,
  onClick,
  children,
  disabled = false,
}: {
  isBack?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 py-3 px-4 rounded-lg ${
      isBack
        ? 'bg-zinc-800 text-white hover:bg-zinc-700'
        : 'bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:from-violet-600 hover:to-blue-600'
    } focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 transition-all ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    {children}
  </button>
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [role, setRole] = useState<'student' | 'lecturer' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleBack = () => {
    if (role) {
      setRole(null);
    } else {
      navigate('/');
    }
  };

  const handleLogin = async () => {
    // Validate form
    if (!formData.email || !validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    // Make sure the role is selected
    if (!role) {
      setError("Please select a role (Student or Lecturer).");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Sign in using the unified login endpoint
      const user = await signIn(formData.email, formData.password);
      
      console.log("Login successful, user:", user);
      
      if (!user || typeof user !== 'object' || !('role' in user)) {
        throw new Error("Invalid user data received from server");
      }
      
      // Wait a bit for the auth state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      // Navigate to the appropriate dashboard based on user role
      const userRole = user.role;
      console.log(`Navigating to /${userRole}/dashboard`);
      navigate(`/${userRole}/dashboard`, { replace: true });
    } catch (error: any) {
      console.error("Error during login:", error);
      let errorMsg = "Invalid email or password. Please try again.";
      
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-6xl mx-auto relative">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-violet-500/20 rounded-full -top-24 -left-24 md:-top-48 md:-left-48 blur-3xl animate-pulse" />
          <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-blue-500/20 rounded-full top-1/2 right-0 blur-3xl animate-pulse delay-1000" />
        </div>

        {!role ? (
          <div className="text-center space-y-8 animate-fadeIn">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="text-zinc-400">Login to your account as:</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center max-w-5xl mx-auto px-4">
              <button
                onClick={() => setRole('student')}
                className="group relative flex-1 p-8 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-xl border border-zinc-700/50
                  transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0
                  hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] max-w-md backdrop-blur-sm"
              >
                <div className="relative flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">Student</h3>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRole('lecturer')}
                className="group relative flex-1 p-8 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-xl border border-zinc-700/50
                  transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0
                  hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] max-w-md backdrop-blur-sm"
              >
                <div className="relative flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center">
                    <School className="w-8 h-8 text-violet-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">Lecturer</h3>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="mt-6">
              <NavigationButton isBack onClick={handleBack}>
                Back
              </NavigationButton>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden bg-zinc-800">
                {role === 'student' ? (
                  <GraduationCap className="w-full h-full p-4 text-blue-400" />
                ) : (
                  <School className="w-full h-full p-4 text-violet-400" />
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Login as {role === 'student' ? 'Student' : 'Lecturer'}
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base">
                Enter your credentials to continue.
              </p>
              {error && <p className="text-red-500">{error}</p>}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-zinc-400">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 pl-12 rounded-lg bg-zinc-800/80 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder={`Enter your ${role === 'student' ? 'school' : 'professional'} email`}
                    autoComplete="email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-zinc-400">Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full p-3 pl-12 rounded-lg bg-zinc-800/80 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <NavigationButton isBack onClick={handleBack}>
                  Back
                </NavigationButton>
                <NavigationButton onClick={handleLogin} disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </NavigationButton>
              </div>
              
              <div className="text-center text-sm text-zinc-400">
                <span>Don't have an account? </span>
                <Link 
                  to={role === 'student' ? '/student/signup' : '/lecturer/signup'} 
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login; 