import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  Users, 
  Clock, 
  ArrowLeft, 
  MessageSquare, 
  Bell,
  CheckCircle,
  Book,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import LecturerBottomNav from '@/components/lecturer/LecturerBottomNav';

interface Class {
  id: string;
  title: string;
  code: string;
  time: string;
  room: string;
  studentsCount: number;
  status: 'active' | 'upcoming' | 'completed';
  nextLesson: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  attendance: number;
  performance: number;
}

const LecturerClasses: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  
  useEffect(() => {
    // Simulate fetching classes data
    const fetchClasses = async () => {
      setTimeout(() => {
        const mockClasses = [
          { 
            id: 'cs101', 
            title: 'Introduction to Programming',
            code: 'CS101',
            time: 'Mon, Wed 10:00 AM',
            room: 'Lab 204',
            studentsCount: 45,
            status: 'active' as const,
            nextLesson: 'Tomorrow, 10:00 AM'
          },
          { 
            id: 'cs302', 
            title: 'Advanced Data Structures',
            code: 'CS302',
            time: 'Tue, Thu 02:00 PM',
            room: 'Lecture Hall A',
            studentsCount: 32,
            status: 'upcoming' as const,
            nextLesson: 'In 2 days, 02:00 PM'
          },
          { 
            id: 'cs303', 
            title: 'Machine Learning Basics',
            code: 'CS303',
            time: 'Fri 04:00 PM',
            room: 'Lab 301',
            studentsCount: 47,
            status: 'upcoming' as const,
            nextLesson: 'Friday, 04:00 PM'
          }
        ];
        
        setClasses(mockClasses);
        
        if (id) {
          const selectedClass = mockClasses.find(c => c.id === id);
          if (selectedClass) {
            setSelectedClass(selectedClass);
            fetchStudents(selectedClass.id);
          }
        } else if (mockClasses.length > 0) {
          setSelectedClass(mockClasses[0]);
          fetchStudents(mockClasses[0].id);
        }
        
        setLoading(false);
      }, 1000);
    };
    
    fetchClasses();
  }, [id]);
  
  const fetchStudents = (classId: string) => {
    // Simulate fetching students for the selected class
    setTimeout(() => {
      const mockStudents = [
        {
          id: 's1',
          name: 'Alex Johnson',
          email: 'alex.j@university.edu',
          avatar: '/api/placeholder/50/50',
          attendance: 92,
          performance: 88
        },
        {
          id: 's2',
          name: 'Morgan Smith',
          email: 'morgan.s@university.edu',
          avatar: '/api/placeholder/50/50',
          attendance: 85,
          performance: 92
        },
        {
          id: 's3',
          name: 'Taylor Brown',
          email: 'taylor.b@university.edu',
          avatar: '/api/placeholder/50/50',
          attendance: 78,
          performance: 79
        },
        {
          id: 's4',
          name: 'Jordan Wilson',
          email: 'jordan.w@university.edu',
          avatar: '/api/placeholder/50/50',
          attendance: 95,
          performance: 95
        },
        {
          id: 's5',
          name: 'Casey Martinez',
          email: 'casey.m@university.edu',
          avatar: '/api/placeholder/50/50',
          attendance: 89,
          performance: 84
        }
      ];
      
      setStudents(mockStudents);
    }, 500);
  };
  
  const handleClassSelection = (classItem: Class) => {
    setSelectedClass(classItem);
    fetchStudents(classItem.id);
    // Update URL
    navigate(`/lecturer/classes/${classItem.id}`);
  };
  
  const sendAnnouncement = () => {
    if (!announcementText.trim()) {
      toast({
        title: "Error",
        description: "Please enter an announcement.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate sending announcement
    toast({
      title: "Announcement Sent",
      description: `Sent to ${students.length} students in ${selectedClass?.code}`,
      variant: "default"
    });
    
    setAnnouncementText('');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-20 px-4">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/lecturer/dashboard')}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold">My Classes</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Classes Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Book className="mr-2 text-blue-400" size={18} /> Your Classes
              </h2>
              <div className="space-y-3">
                {classes.map((classItem) => (
                  <motion.div
                    key={classItem.id}
                    whileHover={{ x: 5 }}
                    onClick={() => handleClassSelection(classItem)}
                    className={`cursor-pointer p-3 rounded-lg transition-colors ${
                      selectedClass?.id === classItem.id 
                        ? 'bg-blue-800/30 border-l-4 border-blue-500' 
                        : 'bg-gray-700/30 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{classItem.code}</h3>
                        <p className="text-sm text-gray-400">{classItem.title}</p>
                      </div>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        classItem.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {classItem.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedClass ? (
              <>
                <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 mb-6">
                  <h2 className="text-xl font-bold mb-3">{selectedClass.title} ({selectedClass.code})</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-blue-400" size={18} />
                        <h3 className="font-medium">Schedule</h3>
                      </div>
                      <p className="text-sm text-gray-300">{selectedClass.time}</p>
                      <p className="text-xs text-gray-400 mt-1">Next: {selectedClass.nextLesson}</p>
                    </div>
                    
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="text-purple-400" size={18} />
                        <h3 className="font-medium">Students</h3>
                      </div>
                      <p className="text-sm text-gray-300">{selectedClass.studentsCount} enrolled</p>
                      <p className="text-xs text-gray-400 mt-1">{students.length} active this week</p>
                    </div>
                    
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="text-amber-400" size={18} />
                        <h3 className="font-medium">Location</h3>
                      </div>
                      <p className="text-sm text-gray-300">{selectedClass.room}</p>
                      <p className="text-xs text-gray-400 mt-1">Building 3, Floor 2</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/30 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Bell className="text-red-400" size={18} />
                      <h3 className="font-medium">Class Announcement</h3>
                    </div>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Send an announcement to all students..."
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={sendAnnouncement}>
                        <Bell className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button onClick={() => navigate(`/lecturer/class/${selectedClass.id}/assignments`)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Manage Assignments
                    </Button>
                    <Button onClick={() => navigate(`/lecturer/class/${selectedClass.id}/resources`)}>
                      <Book className="mr-2 h-4 w-4" />
                      Manage Resources
                    </Button>
                  </div>
                </div>
                
                <Tabs defaultValue="students" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="students" className="space-y-4">
                    <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-4">
                      <h3 className="text-lg font-semibold mb-4">Enrolled Students</h3>
                      <div className="space-y-3">
                        {students.map((student) => (
                          <motion.div
                            key={student.id}
                            whileHover={{ x: 5 }}
                            className="bg-gray-700/30 p-3 rounded-lg flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="font-medium">{student.name}</h4>
                                <p className="text-sm text-gray-400">{student.email}</p>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <div className="text-center">
                                <p className="text-xs text-gray-400">Attendance</p>
                                <p className={`font-medium ${
                                  student.attendance >= 90 
                                    ? 'text-green-400' 
                                    : student.attendance >= 80 
                                    ? 'text-amber-400' 
                                    : 'text-red-400'
                                }`}>
                                  {student.attendance}%
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-400">Performance</p>
                                <p className={`font-medium ${
                                  student.performance >= 90 
                                    ? 'text-green-400' 
                                    : student.performance >= 80 
                                    ? 'text-amber-400' 
                                    : 'text-red-400'
                                }`}>
                                  {student.performance}%
                                </p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <MessageSquare size={16} />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="space-y-4">
                    <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-4">
                      <h3 className="text-lg font-semibold mb-4">Class Analytics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Attendance Rate</h4>
                          <div className="h-8 w-full bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: '87%' }}
                            ></div>
                          </div>
                          <p className="text-right mt-1 text-sm">87% Average</p>
                        </div>
                        
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Assignment Completion</h4>
                          <div className="h-8 w-full bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full" 
                              style={{ width: '92%' }}
                            ></div>
                          </div>
                          <p className="text-right mt-1 text-sm">92% Average</p>
                        </div>
                        
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Resource Access</h4>
                          <div className="h-8 w-full bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full" 
                              style={{ width: '75%' }}
                            ></div>
                          </div>
                          <p className="text-right mt-1 text-sm">75% Average</p>
                        </div>
                        
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Student Engagement</h4>
                          <div className="h-8 w-full bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full" 
                              style={{ width: '68%' }}
                            ></div>
                          </div>
                          <p className="text-right mt-1 text-sm">68% Average</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 flex flex-col items-center justify-center py-20">
                <Book className="w-16 h-16 text-gray-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-300 mb-2">No Class Selected</h2>
                <p className="text-gray-500 text-center mb-6">Select a class from the list to view details and manage students</p>
                <Button onClick={() => handleClassSelection(classes[0])}>
                  View First Class
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <LecturerBottomNav />
    </div>
  );
};

export default LecturerClasses;
