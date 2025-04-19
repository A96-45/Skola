import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  User as UserIcon, 
  Building2, 
  BookOpen, 
  History, 
  GraduationCap,
  Calendar,
  Users,
  BookMarked,
  FileText,
  Clock,
  Award,
  Info,
  Badge
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// Update the User interface to include the missing properties
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  phone?: string;
  university?: string;
  department?: string;
  position?: string;
  bio?: string;
  employeeId?: string;
  specialization?: string;
  universities?: { id: string; name: string; department: string }[];
}

// Update AuthContextType to include the updateUser method
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const LecturerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [position, setPosition] = useState(user?.position || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [employeeId, setEmployeeId] = useState(user?.employeeId || '');
  const [specialization, setSpecialization] = useState(user?.specialization || '');

  // Mock data for demonstration
  const teachingStats = {
    totalStudents: 245,
    activeCourses: 4,
    totalCourses: 12,
    averageRating: 4.8,
    upcomingClasses: 3,
  };

  const recentActivity = [
    { type: 'class', title: 'Web Development Lecture', date: '2024-03-10', status: 'Completed' },
    { type: 'assignment', title: 'Database Project Grading', date: '2024-03-09', status: 'In Progress' },
    { type: 'resource', title: 'Course Materials Update', date: '2024-03-08', status: 'Published' },
  ];

  const currentCourses = [
    { code: 'CS101', name: 'Introduction to Programming', students: 45, progress: 65 },
    { code: 'CS202', name: 'Database Management', students: 38, progress: 75 },
    { code: 'CS301', name: 'Web Development', students: 42, progress: 45 },
    { code: 'CS401', name: 'Advanced Software Engineering', students: 35, progress: 30 },
  ];

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setUniversity(user.university || '');
      setDepartment(user.department || '');
      setPosition(user.position || '');
      setBio(user.bio || '');
      setEmployeeId(user.employeeId || '');
      setSpecialization(user.specialization || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        name,
        email,
        phone,
        university,
        department,
        position,
        bio,
        employeeId,
        specialization,
      });
      toast({
        title: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile.",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Function to handle institution linking
  const handleInstitutionLink = (universityName: string) => {
    window.open(`https://${universityName.toLowerCase().replace(/\s+/g, '')}.edu/login`, '_blank');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00ffd0]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white pb-20">
      <Header />
      <Toaster />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Profile Header */}
          <div className="relative overflow-hidden bg-[#0c0c0c] backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-gray-800">
            {/* Gradient orbs for visual effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00ffd0]/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#8b5cf6]/5 rounded-full blur-3xl animate-pulse delay-700"></div>
            
            <div className="relative flex items-center gap-6">
              <div className="relative">
                <img 
                  src={user?.profileImage || '/api/placeholder/150/150'} 
                  alt={user?.name} 
                  className="w-28 h-28 rounded-2xl object-cover shadow-xl ring-4 ring-[#8b5cf6]/30"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#00ffd0] rounded-full ring-4 ring-[#0c0c0c]"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
                <p className="text-gray-400 mt-1">{user?.position} • {user?.department}</p>
                <div className="flex gap-6 mt-4">
                  <span className="flex items-center gap-2 text-sm text-gray-400">
                    <GraduationCap className="w-5 h-5 text-[#8b5cf6]" />
                    {user?.specialization}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-gray-400">
                    <Building2 className="w-5 h-5 text-[#8b5cf6]" />
                    {user?.university}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative overflow-hidden bg-[#0c0c0c] backdrop-blur-xl rounded-2xl shadow-lg border border-gray-800 p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ffd0]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="inline-flex bg-[#151515] p-1 rounded-xl gap-1 mb-8">
                <TabsTrigger 
                  value="overview"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#1d1d1d] data-[state=active]:text-[#00ffd0] data-[state=active]:shadow-md"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="courses"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#1d1d1d] data-[state=active]:text-[#00ffd0] data-[state=active]:shadow-md"
                >
                  Current Courses
                </TabsTrigger>
                <TabsTrigger 
                  value="activity"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#1d1d1d] data-[state=active]:text-[#00ffd0] data-[state=active]:shadow-md"
                >
                  Recent Activity
                </TabsTrigger>
                <TabsTrigger 
                  value="settings"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#1d1d1d] data-[state=active]:text-[#00ffd0] data-[state=active]:shadow-md"
                >
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-[#151515] backdrop-blur-xl border-gray-800 shadow-lg rounded-xl p-6 hover:shadow-[#00ffd0]/20 transition-all duration-300 group">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#00ffd0]" />
                      Teaching Overview
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Active Courses</span>
                        <span className="text-2xl font-bold text-[#00ffd0]">{teachingStats.activeCourses}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Total Students</span>
                        <span className="text-2xl font-bold text-[#00ffd0]">{teachingStats.totalStudents}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Average Rating</span>
                        <span className="text-2xl font-bold text-[#ffcb6b]">★ {teachingStats.averageRating}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[#151515] backdrop-blur-xl border-gray-800 shadow-lg rounded-xl p-6 hover:shadow-[#00ffd0]/20 transition-all duration-300 group">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#8b5cf6]" />
                      Upcoming Schedule
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Today's Classes</span>
                        <span className="text-2xl font-bold text-[#8b5cf6]">{teachingStats.upcomingClasses}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4 text-[#8b5cf6]" />
                        <span>Next class in 2 hours</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[#151515] backdrop-blur-xl border-gray-800 shadow-lg rounded-xl p-6 hover:shadow-[#00ffd0]/20 transition-all duration-300 group">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-[#0062ff]" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-[#0062ff]" />
                        <span className="text-gray-300">{email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-4 h-4 text-[#0062ff]" />
                        <span className="text-gray-300">{phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-[#0062ff]" />
                        <span className="text-gray-300">{department}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="courses">
                <div className="grid grid-cols-1 gap-6">
                  {currentCourses.map((course, index) => (
                    <Card key={index} className="bg-[#151515] backdrop-blur-xl border-gray-800 shadow-lg rounded-xl p-6 hover:shadow-[#00ffd0]/20 transition-all duration-300 group">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{course.name}</h3>
                          <p className="text-sm text-gray-400">{course.code}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#8b5cf6]" />
                            <span className="text-gray-400">{course.students} Students</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-gray-300">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#1d1d1d] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#00ffd0] to-[#0062ff] rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <Card key={index} className="bg-[#151515] backdrop-blur-xl border-gray-800 shadow-lg rounded-xl p-4 hover:shadow-[#00ffd0]/20 transition-all duration-300 group">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-[#1d1d1d]">
                          {activity.type === 'class' ? (
                            <BookOpen className="w-5 h-5 text-[#00ffd0]" />
                          ) : activity.type === 'assignment' ? (
                            <FileText className="w-5 h-5 text-[#0062ff]" />
                          ) : (
                            <Info className="w-5 h-5 text-[#ffcb6b]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-md font-semibold text-white">{activity.title}</h3>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-gray-400">{activity.date}</span>
                            <Badge className={
                              activity.status === 'Completed' ? 'bg-[#00ffd0]/10 text-[#00ffd0]' :
                              activity.status === 'In Progress' ? 'bg-[#ffcb6b]/10 text-[#ffcb6b]' :
                              'bg-[#0062ff]/10 text-[#0062ff]'
                            }>
                              {activity.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-400">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-[#1d1d1d] border-gray-800 focus:border-[#00ffd0] focus:ring-[#00ffd0]/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-400">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-[#1d1d1d] border-gray-800 focus:border-[#00ffd0] focus:ring-[#00ffd0]/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-400">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-[#1d1d1d] border-gray-800 focus:border-[#00ffd0] focus:ring-[#00ffd0]/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="employeeId" className="text-gray-400">Employee ID</Label>
                      <Input
                        id="employeeId"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="bg-[#1d1d1d] border-gray-800 focus:border-[#00ffd0] focus:ring-[#00ffd0]/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="university" className="text-gray-400">University</Label>
                      <Input
                        id="university"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="bg-[#1d1d1d] border-gray-800 focus:border-[#00ffd0] focus:ring-[#00ffd0]/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-gray-400">Department</Label>
                      <Input
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="bg-[#1d1d1d] border-gray-800 focus:border-[#00ffd0] focus:ring-[#00ffd0]/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-gray-400">Position</Label>
                      <Input
                        id="position"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="bg-[#1d1d1d] border-gray-800 focus:border-[#00ffd0] focus:ring-[#00ffd0]/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="text-gray-400">Specialization</Label>
                      <Input
                        id="specialization"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="bg-[#1d1d1d] border-gray-800 focus:border-[#00ffd0] focus:ring-[#00ffd0]/20"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio" className="text-gray-400">Biography</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="bg-[#1d1d1d] border-gray-800 focus:border-[#00ffd0] focus:ring-[#00ffd0]/20 min-h-[100px]"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="bg-[#00ffd0] hover:bg-[#00ffd0]/80 text-black font-medium"
                  >
                    Save Changes
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerProfile; 