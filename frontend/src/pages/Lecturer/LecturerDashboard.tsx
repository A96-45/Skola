import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, Users, Book, CheckCircle, Bell, LogOut,
  Building2, Plus, Settings, GraduationCap, Search, Clock, MapPin, ArrowRight,
  Key, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { WebSocketProvider } from '@/context/WebSocketContext';
import UniversityDashboard from '@/components/lecturer/UniversityDashboard';
import LecturerNav from '@/components/LecturerNav';
import Header from '@/components/Header';
import LecturerPlannerWidget from '@/components/lecturer/LecturerPlannerWidget';
import { createRoot } from 'react-dom/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AuthService } from '@/services/ApiService';

interface UniversityData {
  name: string;
  department?: string;
}

interface University {
  id: number;
  name: string;
  department: string;
  role: string;
  courses: number;
  students: number;
  color: keyof typeof universityThemes;
  code?: string;
  location?: string;
  website?: string;
}

interface Task {
  id: number;
  title: string;
  subject: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  type?: string;
  universityId: number;
  courseId?: string;
}

interface Class {
  id: string;
  code: string;
  title: string;
  time: string;
  duration?: string;
  students: number;
  room: string;
  status: 'active' | 'upcoming' | 'completed';
  universityId: number;
  courseId?: string;
  year?: string;
  day?: string;
}

interface User {
  id?: number;
  name: string;
  profile_image?: string;
  universities?: UniversityData[];
}

interface AuthContextType {
  user: User | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

const universityThemes = {
  blue: { primary: '[#0062ff]', secondary: '[#0062ff]/70', accent: 'from-[#0062ff]/20 to-black' },
  purple: { primary: '[#8b5cf6]', secondary: '[#8b5cf6]/70', accent: 'from-[#8b5cf6]/20 to-black' },
  emerald: { primary: '[#00ffd0]', secondary: '[#00ffd0]/70', accent: 'from-[#00ffd0]/20 to-black' },
  amber: { primary: '[#ffcb6b]', secondary: '[#ffcb6b]/70', accent: 'from-[#ffcb6b]/20 to-black' }
};

const styles = `
  @keyframes bounce-subtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }
  .animate-bounce-subtle {
    animation: bounce-subtle 2s infinite;
  }
  @keyframes glow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  .animate-glow {
    animation: glow 2s infinite;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

interface AddClassFormData {
  code: string;
  title: string;
  time: string;
  duration: string;
  room: string;
  students: number;
  day: string;
}

interface FormErrors {
  code?: string;
  title?: string;
  time?: string;
  room?: string;
  students?: string;
  day?: string;
}

const DURATIONS = [
  "1 hour",
  "1.5 hours",
  "2 hours",
  "2.5 hours",
  "3 hours"
];

// Lecturer Enrollment Key Dialog Component
const EnrollmentKeyDialog = () => {
  const [enrollmentKey, setEnrollmentKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Check if already generated on component mount
  useEffect(() => {
    const checkExistingKey = async () => {
      try {
        // If we already have a key in local storage, use it
        const storedKey = localStorage.getItem('lecturer_enrollment_key');
        if (storedKey) {
          setEnrollmentKey(storedKey);
        }
      } catch (err) {
        console.error("Error checking existing key:", err);
      }
    };
    
    checkExistingKey();
  }, []);

  const generateKey = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get the authenticated user's ID dynamically
      // In a real application, this would come from your auth context
      const lecturerId = user?.id || 12; // Fallback to 12 if not available in context
      
      const result = await AuthService.generateLecturerKey(Number(lecturerId));
      setEnrollmentKey(result.enrollment_key);
      
      // Store the key in localStorage to persist it
      localStorage.setItem('lecturer_enrollment_key', result.enrollment_key);
      
      toast({
        title: "Key Generated",
        description: "Your enrollment key was successfully generated.",
      });
    } catch (err: any) {
      console.error("Error generating key:", err);
      
      // Extract detailed error message if available
      let errorMsg = "Failed to generate enrollment key";
      if (err.response && err.response.data && err.response.data.detail) {
        errorMsg = `Error: ${err.response.data.detail}`;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate your enrollment key. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (enrollmentKey) {
      navigator.clipboard.writeText(enrollmentKey);
      toast({
        title: "Copied",
        description: "Enrollment key copied to clipboard.",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="p-2 sm:p-3 bg-[#151515] rounded-full backdrop-blur-xl hover:bg-[#1d1d1d] transition-all duration-300"
        >
          <Key className="text-[#00ffd0] w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0c0c0c] border border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Lecturer Enrollment Key</DialogTitle>
          <DialogDescription className="text-gray-400">
            Generate a unique enrollment key to share with your students.
          </DialogDescription>
        </DialogHeader>
        
        {!enrollmentKey && !loading && (
          <div className="flex flex-col space-y-4 py-4">
            <p className="text-sm text-gray-400">
              This key allows students to connect directly to you as their lecturer. 
              Once generated, you can share this key with your students.
            </p>
            <Button 
              onClick={generateKey} 
              disabled={loading}
              className="bg-[#00ffd0] hover:bg-[#00ffd0]/80 text-black"
            >
              Generate Key
            </Button>
          </div>
        )}
        
        {loading && (
          <div className="py-4 text-center">
            <p className="text-gray-300">Generating key...</p>
          </div>
        )}
        
        {error && (
          <div className="py-4">
            <p className="text-[#ff5555]">{error}</p>
            <Button onClick={generateKey} className="mt-2 bg-[#151515] hover:bg-[#1d1d1d] text-white border border-gray-700">
              Try Again
            </Button>
          </div>
        )}
        
        {enrollmentKey && (
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex items-center gap-2">
              <div className="border border-gray-700 bg-[#151515] p-3 rounded-md flex-1 font-mono text-[#00ffd0]">
                {enrollmentKey}
              </div>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={copyToClipboard}
                className="bg-[#151515] border-gray-700 hover:bg-[#1d1d1d] text-[#00ffd0]"
              >
                <Copy size={16} />
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              Share this key with your students. They will use it to connect to you as their lecturer.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const LecturerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [activeUniversity, setActiveUniversity] = useState<number>(() => 
    parseInt(localStorage.getItem('activeUniversity') || '0')
  );
  const [universities, setUniversities] = useState<University[]>(() => {
    const saved = localStorage.getItem('universities');
    if (saved) {
      return JSON.parse(saved);
    }
    
    if (user && user.universities) {
      return user.universities.map((uni: UniversityData, index: number) => ({
        id: index + 1,
        name: uni.name,
        department: uni.department || 'Computer Science',
        role: 'Lecturer',
        courses: 3,
        students: 124,
        color: ['blue', 'purple', 'emerald', 'amber'][index % 4] as keyof typeof universityThemes
      }));
    }
    
    return [];
  });
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Grade Midterm Exams', subject: 'CS101', deadline: '2 days left', priority: 'high', universityId: 1 },
    { id: 2, title: 'Research Proposal Review', subject: 'Department', deadline: 'Completed', priority: 'low', universityId: 1 },
    { id: 3, title: 'Prepare Lecture Notes', subject: 'Advanced Algorithms', deadline: '3 days left', priority: 'medium', universityId: 1 }
  ]);
  const [classes, setClasses] = useState<Class[]>([
    { id: '1', code: 'CS101', title: 'Introduction to Programming', time: '09:00 AM', duration: '2 hours', students: 45, room: 'Lab 204', status: 'upcoming', universityId: 1, courseId: 'CS101', year: '2024', day: 'MON' },
    { id: '2', code: 'CS202', title: 'Data Structures', time: '11:00 AM', duration: '2 hours', students: 32, room: 'Lecture Hall A', status: 'upcoming', universityId: 1, courseId: 'CS202', year: '2024', day: 'MON' },
    { id: '3', code: 'CS303', title: 'Database Systems', time: '02:00 PM', duration: '2 hours', students: 38, room: 'Lab 301', status: 'upcoming', universityId: 1, courseId: 'CS303', year: '2024', day: 'TUE' }
  ]);
  const [selectedDay, setSelectedDay] = useState<string>('today');
  const days = ['today', 'tomorrow', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  const dayMapping = {
    'Monday': 'MON',
    'Tuesday': 'TUE',
    'Wednesday': 'WED',
    'Thursday': 'THU',
    'Friday': 'FRI'
  };

  const getCurrentDayClasses = () => {
    const today = new Date();
    const dayMap: { [key: number]: string } = {
      1: 'MON',
      2: 'TUE',
      3: 'WED',
      4: 'THU',
      5: 'FRI'
    };
    const currentDay = dayMap[today.getDay()];
    
    return classes.filter(cls => 
      cls.status === 'upcoming' && 
      (!cls.day || cls.day === currentDay)
    ).slice(0, 3);
  };

  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [addClassFormData, setAddClassFormData] = useState<AddClassFormData>({
    code: '',
    title: '',
    time: '',
    duration: '2 hours',
    room: '',
    students: 0,
    day: 'MON'
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!addClassFormData.code.trim()) {
      errors.code = "Course code is required";
      isValid = false;
    }

    if (!addClassFormData.title.trim()) {
      errors.title = "Class title is required";
      isValid = false;
    }

    if (!addClassFormData.time) {
      errors.time = "Class time is required";
      isValid = false;
    }

    if (!addClassFormData.room.trim()) {
      errors.room = "Room number is required";
      isValid = false;
    }

    if (addClassFormData.students <= 0) {
      errors.students = "Number of students must be greater than 0";
      isValid = false;
    }

    if (!addClassFormData.day) {
      errors.day = "Day is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  useEffect(() => {
    // Load initial data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (location.state?.universities) {
      setUniversities(location.state.universities);
      localStorage.setItem('universities', JSON.stringify(location.state.universities));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const handleUniversityClick = async (index: number) => {
    setActiveUniversity(index);
    const university = universities[index];
    
    // Update CSS variables for border color
    document.documentElement.style.setProperty('--border-color', `var(--${university.color}-500)`);
    localStorage.setItem('activeUniversity', index.toString());

    try {
      // Filter tasks and classes for selected university
      const universityTasks = tasks.filter(task => task.universityId === university.id);
      const universityClasses = classes.filter(cls => cls.universityId === university.id);
      
      setTasks(universityTasks);
      setClasses(universityClasses);
    } catch (error) {
      console.error('Error updating university data:', error);
      toast({
        title: "Error",
        description: "Failed to load university data",
        variant: "destructive"
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleNotificationsClick = () => {
    navigate('/lecturer/notifications');
    setHasUnreadNotifications(false);
  };

  const handleCreateResource = () => {
    const currentUni = universities[activeUniversity];
    navigate(`/lecturer/universities/${currentUni.id}/resources`);
  };

  const handleCreateAssignment = () => {
    const currentUni = universities[activeUniversity];
    navigate(`/lecturer/universities/${currentUni.id}/assignments`);
  };

  const handleFormChange = (field: keyof AddClassFormData, value: string | number) => {
    setAddClassFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddClass = () => {
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
      return;
    }

    // Check for time conflicts
    const timeConflict = classes.some(cls => 
      cls.day === addClassFormData.day && 
      cls.time === addClassFormData.time &&
      cls.universityId === universities[activeUniversity].id
    );

    if (timeConflict) {
      toast({
        title: "Error",
        description: "There is already a class scheduled at this time",
        variant: "destructive"
      });
      return;
    }

    const newClass: Class = {
      id: Date.now().toString(),
      ...addClassFormData,
      status: 'upcoming',
      universityId: universities[activeUniversity].id,
      courseId: addClassFormData.code,
      year: new Date().getFullYear().toString()
    };

    setClasses(prev => [...prev, newClass]);
    setIsAddClassModalOpen(false);
    setAddClassFormData({
      code: '',
      title: '',
      time: '',
      duration: '2 hours',
      room: '',
      students: 0,
      day: 'MON'
    });
    setFormErrors({});

    toast({
      title: "Success",
      description: "Class has been added successfully",
    });
  };

  const AddClassModal = () => {
    const handleTimeChange = (value: string) => {
      handleFormChange('time', value);
      setFormErrors(prev => ({ ...prev, time: undefined }));
    };

    return (
      <Dialog open={isAddClassModalOpen} onOpenChange={setIsAddClassModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>
              Add a new class to your schedule. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code*
              </Label>
              <div className="col-span-3">
                <Input
                  id="code"
                  value={addClassFormData.code}
                  onChange={(e) => {
                    handleFormChange('code', e.target.value.toUpperCase());
                    setFormErrors(prev => ({ ...prev, code: undefined }));
                  }}
                  className={cn(
                    "bg-gray-800 border-gray-700",
                    formErrors.code && "border-red-500"
                  )}
                  placeholder="CS101"
                />
                {formErrors.code && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.code}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title*
              </Label>
              <div className="col-span-3">
                <Input
                  id="title"
                  value={addClassFormData.title}
                  onChange={(e) => {
                    handleFormChange('title', e.target.value);
                    setFormErrors(prev => ({ ...prev, title: undefined }));
                  }}
                  className={cn(
                    "bg-gray-800 border-gray-700",
                    formErrors.title && "border-red-500"
                  )}
                  placeholder="Introduction to Programming"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time*
              </Label>
              <div className="col-span-3">
                <Input
                  type="time"
                  id="time"
                  value={addClassFormData.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className={cn(
                    "bg-gray-800 border-gray-700",
                    formErrors.time && "border-red-500"
                  )}
                />
                {formErrors.time && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.time}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <Select 
                value={addClassFormData.duration}
                onValueChange={(value) => handleFormChange('duration', value)}
              >
                <SelectTrigger className="col-span-3 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {DURATIONS.map(duration => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="room" className="text-right">
                Room*
              </Label>
              <div className="col-span-3">
                <Input
                  id="room"
                  value={addClassFormData.room}
                  onChange={(e) => {
                    handleFormChange('room', e.target.value);
                    setFormErrors(prev => ({ ...prev, room: undefined }));
                  }}
                  className={cn(
                    "bg-gray-800 border-gray-700",
                    formErrors.room && "border-red-500"
                  )}
                  placeholder="Lab 204"
                />
                {formErrors.room && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.room}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="students" className="text-right">
                Students*
              </Label>
              <div className="col-span-3">
                <Input
                  id="students"
                  type="number"
                  min="1"
                  value={addClassFormData.students}
                  onChange={(e) => {
                    handleFormChange('students', parseInt(e.target.value) || 0);
                    setFormErrors(prev => ({ ...prev, students: undefined }));
                  }}
                  className={cn(
                    "bg-gray-800 border-gray-700",
                    formErrors.students && "border-red-500"
                  )}
                  placeholder="30"
                />
                {formErrors.students && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.students}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">
                Day*
              </Label>
              <div className="col-span-3">
                <Select 
                  value={addClassFormData.day}
                  onValueChange={(value) => {
                    handleFormChange('day', value);
                    setFormErrors(prev => ({ ...prev, day: undefined }));
                  }}
                >
                  <SelectTrigger className={cn(
                    "bg-gray-800 border-gray-700",
                    formErrors.day && "border-red-500"
                  )}>
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="MON">Monday</SelectItem>
                    <SelectItem value="TUE">Tuesday</SelectItem>
                    <SelectItem value="WED">Wednesday</SelectItem>
                    <SelectItem value="THU">Thursday</SelectItem>
                    <SelectItem value="FRI">Friday</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.day && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.day}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddClassModalOpen(false);
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddClass}>
              Add Class
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white pb-20">
        <Header />
        <div className="bg-[#0c0c0c] border-b border-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center w-full max-w-7xl mx-auto gap-4 sm:gap-0 p-4 sm:p-6">
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={user?.profile_image || '/api/placeholder/150/150'} 
                    alt={user?.name || 'User'} 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-gray-800 shadow-lg backdrop-blur-xl" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-[#00ffd0] rounded-full border-2 border-[#0c0c0c] animate-pulse" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold">
                    {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {universities[activeUniversity]?.department || 'Department'} • {universities[activeUniversity]?.role || 'Lecturer'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
              <EnrollmentKeyDialog />
              <Button 
                variant="ghost" 
                className="p-2 sm:p-3 bg-[#151515] rounded-full relative backdrop-blur-xl hover:bg-[#1d1d1d] transition-all duration-300"
                onClick={handleNotificationsClick}
              >
                <Bell className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                {hasUnreadNotifications && (
                  <span className="absolute top-1 right-1 sm:top-2 sm:right-2 w-2 h-2 bg-[#ff5555] rounded-full animate-pulse" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                onClick={logout} 
                className="p-2 sm:p-3 bg-[#151515] rounded-full backdrop-blur-xl hover:bg-[#1d1d1d] transition-all duration-300"
              >
                <LogOut className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4 -mt-8 mx-2 sm:mx-4 max-w-7xl lg:mx-auto">
          {[
            { id: 'classes', icon: CalendarIcon, value: `${classes.length}`, color: "#00ffd0" },
            { id: 'students', icon: Users, value: universities[activeUniversity]?.students.toString() || "0", color: "#ffcb6b" }
          ].map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`relative overflow-hidden rounded-xl p-3 sm:p-4 bg-[#0c0c0c] border border-gray-800 backdrop-blur-xl
                group hover:shadow-lg hover:shadow-[${item.color}]/20 transition-all duration-300 transform hover:scale-105`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/40 backdrop-blur-xl"></div>
              <div className="relative flex items-center justify-center gap-3">
                <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-[${item.color}]
                  transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`} />
                <span className={`text-xl sm:text-2xl font-bold text-[${item.color}]
                  transition-all duration-300 group-hover:scale-110`}>
                  {item.value}
                </span>
              </div>
              <div className={`absolute inset-0 border-2 border-[${item.color}]/20 rounded-xl 
                transition-opacity duration-300 opacity-0 group-hover:opacity-100`}></div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {universities.map((university, index) => (
                <motion.div
                  key={university.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: activeUniversity === index ? 1.02 : 1,
                    boxShadow: activeUniversity === index ? '0 0 20px rgba(0, 255, 208, 0.3)' : 'none'
                  }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => handleUniversityClick(index)}
                  className={`relative bg-[#0c0c0c] backdrop-blur-xl rounded-2xl shadow-lg transition-all duration-300 p-4 sm:p-6 cursor-pointer
                    ${activeUniversity === index ? 'ring-2 ring-[#00ffd0] bg-[#151515]' : 'hover:bg-[#151515]'}
                    ${activeUniversity === index ? 'after:absolute after:inset-0 after:rounded-2xl after:ring-4 after:ring-[#00ffd0]/20 after:animate-pulse' : ''}
                  `}
                >
                  {/* Gradient orb effect */}
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#00ffd0]/5 rounded-full blur-3xl animate-pulse"></div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-start gap-4">
                      <div className={`relative ${activeUniversity === index ? 'animate-bounce-subtle' : ''}`}>
                        <Building2 className="text-[#00ffd0] mt-1" size={24} />
                        {activeUniversity === index && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-3 h-3 bg-[#00ffd0] rounded-full"
                          />
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          {university.name}
                          {activeUniversity === index && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-[#00ffd0] text-sm font-normal"
                            >
                              (Current)
                            </motion.span>
                          )}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">{university.department} • {university.role}</p>
                        <div className="flex gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <Book className="text-[#00ffd0]" size={16} />
                            <span className="text-sm">{university.courses} Courses</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="text-[#00ffd0]" size={16} />
                            <span className="text-sm">{university.students} Students</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        navigate(`/lecturer/university-settings/${university.id}`); 
                      }}
                      className="text-[#00ffd0] hover:text-white relative bg-[#151515] hover:bg-[#1d1d1d] p-2 rounded-full"
                    >
                      <Settings size={20} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-3 sm:space-y-6">
              <div>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Clock className="text-[#00ffd0]" size={20} />
                    Upcoming Classes
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddClassModalOpen(true)}
                    className="text-[10px] sm:text-sm bg-[#00ffd0]/10 hover:bg-[#00ffd0]/20
                      border-[#00ffd0]/30 hover:border-[#00ffd0]/50 
                      text-[#00ffd0] hover:text-white transition-all duration-300"
                  >
                    <Plus className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                    Add Class
                  </Button>
                </div>

                <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                        selectedDay === day 
                          ? 'bg-[#00ffd0] text-black' 
                          : 'bg-[#0c0c0c] text-gray-400 hover:bg-[#151515]'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className="bg-[#0c0c0c] backdrop-blur-xl rounded-xl p-6 border border-gray-800 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Today's Classes</h2>
                  </div>

                  <div className="space-y-4">
                    {getCurrentDayClasses().length > 0 ? (
                      getCurrentDayClasses().map((cls, index) => (
                        <motion.div
                          key={cls.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-[#151515] p-4 rounded-lg border border-gray-800 hover:shadow-lg hover:shadow-[#00ffd0]/10 transition-all duration-300"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{cls.code}: {cls.title}</h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-4 w-4 text-[#00ffd0]" />
                                  {cls.time}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="mr-1 h-4 w-4 text-[#ff5555]" />
                                  {cls.room}
                                </div>
                                <div className="flex items-center">
                                  <Users className="mr-1 h-4 w-4 text-[#0062ff]" />
                                  {cls.students} students
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#00ffd0] hover:text-white bg-[#00ffd0]/10 hover:bg-[#00ffd0]/20 rounded-full p-2"
                            >
                              <ArrowRight size={16} />
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        No upcoming classes for today
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-xl font-semibold flex items-center gap-2">
                  <Clock className="text-[#00ffd0] w-4 h-4 sm:w-5 sm:h-5" /> Schedules
                </h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/lecturer/schedules')}
                    className="text-[10px] sm:text-sm bg-[#00ffd0]/10 hover:bg-[#00ffd0]/20
                      border-[#00ffd0]/30 hover:border-[#00ffd0]/50 
                      text-[#00ffd0] hover:text-white transition-all duration-300 transform hover:scale-105 
                      hover:shadow-lg hover:shadow-[#00ffd0]/20"
                  >
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="ml-1 sm:ml-2">View All</span>
                  </Button>
                </div>
              </div>
              <div className="bg-[#0c0c0c] backdrop-blur-lg rounded-xl p-6 border border-gray-800">
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-500 mb-3" />
                  <h3 className="text-lg font-medium text-gray-300">No Schedules</h3>
                  <p className="text-gray-500 mt-1">Add your first schedule to keep track of your tasks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddClassModal />
      <LecturerNav />
    </>
  );
};

export default LecturerDashboard;
