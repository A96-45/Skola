import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import BottomNav from '../../components/BottomNav';
import { 
  Book, 
  FileText, 
  Video, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Users, 
  ArrowLeft,
  MessageSquare,
  Download,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import axios from 'axios';

interface Course {
  id: string;
  title: string;
  code: string;
  instructor: string;
  description: string;
  progress: number;
  nextClass: string;
  students: number;
  hasNotifications?: boolean;
}

interface Resource {
  id: string;
  title: string;
  type: 'document' | 'video';
  date: string;
  url: string;
  new?: boolean;
}

interface Assignment {
  id: string;
  title: string;
  deadline: string;
  status: 'completed' | 'pending' | 'upcoming';
  new?: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
}

const StudentCourse: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // Get tab from URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const highlightId = searchParams.get('highlight');
  const defaultTab = searchParams.get('tab') || 'resources';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  useEffect(() => {
    // Fetch course data
    const fetchCourse = async () => {
      setLoading(true);
      try {
        if (!id || !user?.id) {
          throw new Error("Missing course ID or user ID");
        }
        
        // Get course details
        const response = await axios.get(`/api/student/course/${id}?student_id=${user.id}`);
        const courseData = response.data;
        
        setCourse({
          id: courseData.id.toString(),
          title: courseData.title,
          code: courseData.code,
          instructor: courseData.instructor_name || 'Not assigned',
          description: courseData.description || '',
          progress: courseData.progress || 0,
          nextClass: courseData.next_class || 'Not scheduled',
          students: courseData.student_count || 0,
          hasNotifications: courseData.has_notifications || false
        });
        
        // Get resources for this course
        const resourcesResponse = await axios.get(`/api/student/course/${id}/resources?student_id=${user.id}`);
        setResources(resourcesResponse.data || []);
        
        // Get assignments for this course
        const assignmentsResponse = await axios.get(`/api/student/course/${id}/assignments?student_id=${user.id}`);
        setAssignments(assignmentsResponse.data || []);
        
        // Get announcements for this course
        const announcementsResponse = await axios.get(`/api/student/course/${id}/announcements?student_id=${user.id}`);
        setAnnouncements(announcementsResponse.data || []);
        
        // If there's a highlight ID, scroll to it
        if (highlightId) {
          setTimeout(() => {
            const element = document.getElementById(highlightId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              element.classList.add('bg-blue-500/20');
              setTimeout(() => {
                element.classList.remove('bg-blue-500/20');
              }, 3000);
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load course details. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [id, highlightId, user?.id]);
  
  // Handle tab change
  useEffect(() => {
    if (defaultTab && ['resources', 'assignments', 'announcements'].includes(defaultTab)) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);
  
  const viewNotifications = () => {
    navigate('/student/notifications');
  };
  
  const handleResourceDownload = (resource: Resource) => {
    // In a real app, this would initiate a download
    toast({
      title: "Download Started",
      description: `${resource.title} is being downloaded.`
    });
    
    // Mark as not new
    setResources(resources.map(r => 
      r.id === resource.id ? { ...r, new: false } : r
    ));
  };
  
  const handleViewAssignment = (assignment: Assignment) => {
    // Mark as not new
    setAssignments(assignments.map(a => 
      a.id === assignment.id ? { ...a, new: false } : a
    ));
    
    // In a real app, this would navigate to the assignment details
    toast({
      title: "Opening Assignment",
      description: assignment.title
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white p-4">
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">Course not found</h2>
          <Button 
            onClick={() => navigate('/student/courses')}
            className="mt-4"
          >
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-20">
      <Header />
      
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/student/courses')}
            className="mr-2 p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          
          {course.hasNotifications && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto relative" 
              onClick={viewNotifications}
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          )}
        </div>
        
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{course.code}</h2>
              <p className="text-gray-400">{course.instructor}</p>
              <p className="mt-2 text-gray-300">{course.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center text-sm">
                  <Calendar className="text-blue-400 mr-2" size={16} />
                  <span>Next class: {course.nextClass}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="text-purple-400 mr-2" size={16} />
                  <span>{course.students} students enrolled</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700/30 p-4 rounded-lg w-full md:w-56 flex-shrink-0">
              <div className="text-center mb-3">
                <span className="text-2xl font-bold">{course.progress}%</span>
                <p className="text-sm text-gray-400">Course Progress</p>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <Button className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Instructor
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="resources">Course Materials</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resources" className="space-y-4">
            {resources.length > 0 ? (
              resources.map((resource) => (
                <motion.div
                  key={resource.id}
                  id={resource.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/30 backdrop-blur-lg rounded-lg p-4 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center">
                    <div className="bg-gray-700/50 p-2 rounded-lg mr-3">
                      {resource.type === 'document' ? 
                        <FileText className="text-blue-400" size={20} /> : 
                        <Video className="text-red-400" size={20} />
                      }
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium">{resource.title}</h3>
                        {resource.new && (
                          <Badge variant="default" className="ml-2 bg-blue-500 text-white">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {new Date(resource.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleResourceDownload(resource)}>
                    <Download size={18} />
                  </Button>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-800/30 backdrop-blur-lg rounded-lg">
                <Book className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300">No Course Materials Yet</h3>
                <p className="text-gray-500 mt-2">Check back later for updates</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-4">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  id={assignment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/30 backdrop-blur-lg rounded-lg p-4"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium">{assignment.title}</h3>
                        {assignment.new && (
                          <Badge variant="default" className="ml-2 bg-blue-500 text-white">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm mt-1">
                        <Clock className="text-gray-400 mr-2" size={14} />
                        <span className="text-gray-400">Due: {assignment.deadline}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      assignment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant={assignment.status === 'completed' ? "secondary" : "default"}
                      className="w-full"
                      disabled={assignment.status === 'completed'}
                      onClick={() => handleViewAssignment(assignment)}
                    >
                      {assignment.status === 'completed' ? (
                        <><CheckCircle className="mr-2 h-4 w-4" /> Submitted</>
                      ) : (
                        'View Assignment'
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-800/30 backdrop-blur-lg rounded-lg">
                <FileText className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300">No Assignments Yet</h3>
                <p className="text-gray-500 mt-2">Check back later for updates</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="announcements" className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gray-800/30 backdrop-blur-lg rounded-lg p-4 ${
                    announcement.isImportant ? 'border-l-4 border-red-500' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg mr-3 ${
                      announcement.isImportant ? 'bg-red-500/20' : 'bg-gray-700/50'
                    }`}>
                      <Bell className={announcement.isImportant ? "text-red-400" : "text-blue-400"} size={20} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{announcement.title}</h3>
                        {announcement.isImportant && (
                          <Badge variant="outline" className="border-red-500 text-red-400">Important</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(announcement.date).toLocaleDateString()}
                      </p>
                      <p className="mt-3 text-gray-300">
                        {announcement.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-800/30 backdrop-blur-lg rounded-lg">
                <Bell className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300">No Announcements Yet</h3>
                <p className="text-gray-500 mt-2">Check back later for updates</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default StudentCourse;
