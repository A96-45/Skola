import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import BottomNav from '@/components/BottomNav';
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
  Clock,
  Award,
  FileText
} from 'lucide-react';

const StudentProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [course, setCourse] = useState(user?.course || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [semester, setSemester] = useState(user?.semester || '');

  // Mock data for demonstration
  const academicProgress = {
    currentSemester: 'Spring 2024',
    gpa: 3.75,
    creditsCompleted: 85,
    totalCredits: 120,
    attendance: 92,
  };

  const recentActivity = [
    { type: 'assignment', title: 'Database Design Project', date: '2024-03-10', status: 'Submitted' },
    { type: 'attendance', title: 'Web Development', date: '2024-03-09', status: 'Present' },
    { type: 'exam', title: 'Midterm Examination', date: '2024-03-08', status: 'Completed' },
  ];

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setUniversity(user.university || '');
      setDepartment(user.department || '');
      setCourse(user.course || '');
      setBio(user.bio || '');
      setStudentId(user.studentId || '');
      setSemester(user.semester || '');
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
        course,
        bio,
        studentId,
        semester,
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
  const handleInstitutionLink = () => {
    if (user?.university) {
      window.open(`https://${user.university.toLowerCase().replace(/\s+/g, '')}.edu/login`, '_blank');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white pb-20">
      <Header />
      <Toaster />
      <div className="container mx-auto px-4 pb-24">
        <div className="space-y-8 py-8">
          {/* Profile Header */}
          <div className="flex items-center gap-6 bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-gray-700/50">
            <div className="relative">
              <img 
                src={user?.profileImage || '/api/placeholder/150/150'} 
                alt={user?.name} 
                className="w-28 h-28 rounded-2xl object-cover shadow-xl ring-4 ring-indigo-500/30"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-gray-900"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
              <p className="text-gray-400 mt-1">{user?.course} • {user?.semester} Semester</p>
              <div className="flex gap-6 mt-4">
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <GraduationCap className="w-5 h-5 text-indigo-500" />
                  Student ID: {user?.studentId}
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <Building2 className="w-5 h-5 text-indigo-500" />
                  {user?.university}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-700/50 p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="inline-flex bg-gray-900/50 p-1 rounded-xl gap-1 mb-8">
                <TabsTrigger 
                  value="overview"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/50 transition-all text-gray-400"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="academic"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/50 transition-all text-gray-400"
                >
                  Academic Progress
                </TabsTrigger>
                <TabsTrigger 
                  value="activity"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/50 transition-all text-gray-400"
                >
                  Recent Activity
                </TabsTrigger>
                <TabsTrigger 
                  value="settings"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/50 transition-all text-gray-400"
                >
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-lg rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-500" />
                      Academic Summary
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Overall Progress</span>
                          <span className="text-indigo-400 font-medium">{Math.round((academicProgress.creditsCompleted / academicProgress.totalCredits) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(academicProgress.creditsCompleted / academicProgress.totalCredits) * 100}
                          className="h-2 bg-gray-700"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Current GPA</span>
                        <span className="text-2xl font-bold text-indigo-400">{academicProgress.gpa}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Credits Completed</span>
                        <span className="text-white font-medium">{academicProgress.creditsCompleted}/{academicProgress.totalCredits}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-lg rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      Attendance
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Overall Attendance</span>
                        <span className="text-2xl font-bold text-indigo-400">{academicProgress.attendance}%</span>
                      </div>
                      <Progress 
                        value={academicProgress.attendance} 
                        className="h-2 bg-gray-700"
                      />
                    </div>
                  </Card>

                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-lg rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-indigo-500" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">{email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">{phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">{department}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="academic">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-lg rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Semester</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Semester</span>
                        <span>{academicProgress.currentSemester}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Current GPA</span>
                        <span className="text-2xl font-bold text-indigo-400">{academicProgress.gpa}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Credits This Semester</span>
                        <span>18</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-lg rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Overall Progress</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Degree Progress</span>
                          <span className="text-indigo-400 font-medium">{Math.round((academicProgress.creditsCompleted / academicProgress.totalCredits) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(academicProgress.creditsCompleted / academicProgress.totalCredits) * 100}
                          className="h-2 bg-gray-700"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Credits Completed</span>
                        <span className="text-white font-medium">{academicProgress.creditsCompleted}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Credits Remaining</span>
                        <span className="text-white font-medium">{academicProgress.totalCredits - academicProgress.creditsCompleted}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-lg rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                        <div className="p-2 rounded-lg bg-gray-900">
                          {activity.type === 'assignment' && <FileText className="w-5 h-5 text-blue-400" />}
                          {activity.type === 'attendance' && <Clock className="w-5 h-5 text-green-400" />}
                          {activity.type === 'exam' && <Award className="w-5 h-5 text-purple-400" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{activity.title}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-400">{activity.date}</span>
                            <span className="text-sm text-emerald-400">{activity.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-lg rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Profile Settings</h3>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                      <input
                        type="text"
                        id="name"
                        className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <input
                        type="email"
                        id="email"
                        className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                      <input
                        type="tel"
                        id="phone"
                        className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentId" className="text-gray-300">Student ID</Label>
                      <input
                        type="text"
                        id="studentId"
                        className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="semester" className="text-gray-300">Current Semester</Label>
                      <input
                        type="text"
                        id="semester"
                        className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="course" className="text-gray-300">Course</Label>
                      <input
                        type="text"
                        id="course"
                        className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                      <textarea
                        id="bio"
                        className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white h-24"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25"
                      >
                        Update Profile
                      </button>
                    </div>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default StudentProfile; 