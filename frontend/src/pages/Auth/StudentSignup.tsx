import React, { useState, useEffect } from 'react';
import { ArrowRight, School, GraduationCap, ArrowLeft, Search, Mail } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import UniversityCard from '../../components/UniversityCard';
import ProgressDot from '../../components/ProgressDot';
import NavigationButton from '../../components/NavigationButton';
import { useAuth } from '@/context/AuthContext';
import { universities } from '@/data/universities';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const StudentSignup: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    universityId: '',
    universityName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUniversities, setFilteredUniversities] = useState(universities);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUniversities(universities);
    } else {
      const filtered = universities.filter(university => 
        university.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        university.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUniversities(filtered);
    }
  }, [searchQuery]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    if (step === 1 && !formData.name) {
      setError("Please enter your name to continue.");
      return;
    } else if (step === 2 && (!formData.email || !validateEmail(formData.email))) {
      setError("Please enter a valid school email address.");
      return;
    } else if (step === 3 && !formData.universityId) {
      setError("Please select a university to continue.");
      return;
    }
    setError(null);
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/');
  };

  const handleUniversitySelect = (universityId: string) => {
    const selectedUni = universities.find(u => u.id === universityId);
    if (selectedUni) {
      setFormData({
        ...formData,
        universityId,
        universityName: selectedUni.name
      });
    }
  };

  const handleUniversityRemove = () => {
    setFormData({
      ...formData,
      universityId: '',
      universityName: ''
    });
  };

  const handleContinueToDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Set a timeout to prevent infinite loading
      const signupTimeout = setTimeout(() => {
        if (isLoading) {
          toast({
            title: "Note",
            description: "Account creation is taking longer than expected. Proceeding to dashboard...",
          });
          navigate('/student/dashboard', { replace: true });
        }
      }, 5000); // 5 second timeout
      
      await signUp(
        formData.email,
        'password123',
        'student',
        formData.universityId,
        undefined,  // no university units for students
        formData.name // Pass the actual name
      );

      // Clear the timeout since signup was successful
      clearTimeout(signupTimeout);

      // Wait a bit for the auth state to update
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Success",
        description: "Account created successfully",
      });

      navigate('/student/dashboard', { replace: true });
    } catch (error: any) {
      console.error("Error during signup:", error);
      let errorMsg = "Error creating account. Please try again.";
      
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

        <div className="flex justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
          <ProgressDot active={step === 1} completed={step > 1} />
          <ProgressDot active={step === 2} completed={step > 2} />
          <ProgressDot active={step === 3} completed={step > 3} />
        </div>

        {step === 1 && (
          <div className="max-w-md mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden bg-zinc-800">
                <GraduationCap className="w-full h-full p-4 text-blue-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Welcome to Student Registration</h2>
              <p className="text-zinc-400 text-sm sm:text-base">Let's start with your name.</p>
              {error && <p className="text-red-500">{error}</p>}
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-3 rounded-lg bg-zinc-800/80 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              placeholder="Enter your name"
            />
            <div className="flex gap-3 mt-6">
              <NavigationButton isBack onClick={handleBack}>
                Back
              </NavigationButton>
              <NavigationButton onClick={handleNext}>
                Next
              </NavigationButton>
            </div>
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Already have an account? <span className="text-blue-400">Log in</span>
              </Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-md mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden bg-zinc-800">
                <Mail className="w-full h-full p-4 text-blue-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Enter Your School Email</h2>
              <p className="text-zinc-400 text-sm sm:text-base">Please use your university email address.</p>
              {error && <p className="text-red-500">{error}</p>}
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-3 rounded-lg bg-zinc-800/80 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              placeholder="student@university.edu"
              autoComplete="email"
            />
            <div className="flex gap-3 mt-6">
              <NavigationButton isBack onClick={handleBack}>
                Back
              </NavigationButton>
              <NavigationButton onClick={handleNext}>
                Next
              </NavigationButton>
            </div>
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Already have an account? <span className="text-blue-400">Log in</span>
              </Link>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
            <h2 className="text-xl sm:text-2xl font-bold text-center">Select Your University</h2>
            <p className="text-zinc-400 text-center text-sm">Choose the university you attend</p>
            
            {formData.universityId && (
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {formData.universityName}
                  <button 
                    onClick={handleUniversityRemove}
                    className="ml-1 text-xs rounded-full hover:bg-zinc-700 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            )}
            
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 
                    focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="Search universities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUniversities.map(university => (
                <UniversityCard
                  key={university.id}
                  university={university}
                  selected={formData.universityId === university.id}
                  onClick={() => handleUniversitySelect(university.id)}
                />
              ))}
            </div>

            {filteredUniversities.length === 0 && (
              <div className="text-center py-8 text-zinc-400">
                <p>No universities found matching "{searchQuery}"</p>
              </div>
            )}
            
            {error && <p className="text-red-500 text-center">{error}</p>}
            
            <div className="flex gap-3 mt-6 max-w-md mx-auto">
              <NavigationButton isBack onClick={handleBack}>Back</NavigationButton>
              <NavigationButton onClick={handleNext}>Next</NavigationButton>
            </div>
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Already have an account? <span className="text-blue-400">Log in</span>
              </Link>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-md mx-auto text-center space-y-6 sm:space-y-8 animate-fadeIn">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center">
              <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold">Welcome, {formData.name}!</h2>
              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <p className="text-zinc-300 mb-2">{formData.email}</p>
                <div className="text-zinc-300 mb-2">
                  <p className="font-medium mb-1">University:</p>
                  <p className="text-sm">{formData.universityName}</p>
                </div>
              </div>
              <p className="text-zinc-400 text-sm sm:text-base">You're all set to explore your student dashboard!</p>
              {error && <p className="text-red-500 text-sm">{error.toString()}</p>}
            </div>
            <button 
              onClick={handleContinueToDashboard}
              disabled={isLoading}
              className={`
                group flex items-center justify-center gap-2 px-6 py-3 w-full
                bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-lg
                shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-2px]
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Already have an account? <span className="text-blue-400">Log in</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StudentSignup;
