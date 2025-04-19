import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, Users, Calendar, ArrowLeft, FileText, Video, Clock, Bookmark, Check, MessageCircle, ArrowRight, Edit, Trash2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { AuthService } from '@/services/ApiService';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import UnitCard from '@/components/UnitCard';
import axios from 'axios';

interface Course {
  id: string;
  title: string;
  code: string;
  instructor: string;
  progress: number;
  nextClass: string;
  students: number;
  description: string;
  color: string;
  imageUrl: string;
}

interface Module {
  id: string;
  title: string;
  items: ContentItem[];
}

interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'assignment';
  duration?: string;
  completed: boolean;
  path: string;
}

interface Note {
  unit_code: string;
  content: string;
  timestamp: string;
}

interface Unit {
  id: string;
  title: string;
  description: string;
  progress: number;
  duration: string;
  itemCount: number;
  completed: boolean;
  moduleId: string;
}

const StudentCourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [activeTab, setActiveTab] = useState('units');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        if (!courseId || !user?.id) {
          throw new Error("Missing course ID or user ID");
        }
        
        // Get detailed course information
        const response = await axios.get(`/api/student/course-detail/${courseId}?student_id=${user.id}`);
        const courseData = response.data;
        
        setCourse({
          id: courseData.id.toString(),
          title: courseData.title,
          code: courseData.code,
          instructor: courseData.instructor_name || 'Not assigned',
          progress: courseData.progress || 0,
          nextClass: courseData.next_class || 'Not scheduled',
          students: courseData.student_count || 0,
          description: courseData.description || '',
          color: courseData.color || 'bg-blue-500',
          imageUrl: courseData.image_url || '/images/course-default.jpg'
        });
        
        // Get course modules and content items
        const modulesResponse = await axios.get(`/api/student/course-detail/${courseId}/modules?student_id=${user.id}`);
        const moduleData = modulesResponse.data || [];
        setModules(moduleData);
        
        // Create units from modules data
        const unitData = moduleData.map((module: Module) => {
          // Calculate progress as percentage of completed items
          const completedItems = module.items.filter(item => item.completed).length;
          const progress = module.items.length ? Math.round((completedItems / module.items.length) * 100) : 0;
          
          // Calculate total duration
          const totalMinutes = module.items.reduce((total, item) => {
            if (item.duration) {
              // Parse duration like "10 min" into number
              const minutes = parseInt(item.duration.split(" ")[0]);
              return isNaN(minutes) ? total : total + minutes;
            }
            return total;
          }, 0);
          
          // Format duration as hours and minutes
          const duration = totalMinutes >= 60 
            ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` 
            : `${totalMinutes}m`;
          
          return {
            id: module.id,
            title: module.title,
            description: `This unit contains ${module.items.length} resources including videos, documents, and assignments.`,
            progress,
            duration,
            itemCount: module.items.length,
            completed: progress === 100,
            moduleId: module.id
          };
        });
        
        setUnits(unitData);
        
      } catch (error) {
        console.error('Error fetching course details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load course details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, user?.id]);

  // Fetch notes for the current course
  const fetchNotes = async () => {
    if (!course || !user) return;
    
    setLoadingNotes(true);
    try {
      const studentId = parseInt(user.id);
      const allNotes = await AuthService.getStudentNotes(studentId);
      
      // Filter notes for this course
      const courseNotes = allNotes.filter(note => note.unit_code === course.code);
      setNotes(courseNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Fetch notes when course changes or on a timer
  useEffect(() => {
    if (course) {
      fetchNotes();
      
      // Set up periodic refresh
      const intervalId = setInterval(fetchNotes, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [course, user]);

  const handleContentItemClick = (path: string) => {
    navigate(path);
  };

  const handleUnitClick = (unitId: string, tab?: string) => {
    // If a specific tab is provided, navigate to that tab
    if (tab) {
      setActiveTab(tab);
      
      // Find the corresponding module
      const unit = units.find(u => u.id === unitId);
      if (unit) {
        setTimeout(() => {
          const moduleElement = document.getElementById(`module-${unit.moduleId}`);
          if (moduleElement) {
            moduleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Add a highlight animation
            moduleElement.classList.add('highlight-module');
            setTimeout(() => {
              moduleElement.classList.remove('highlight-module');
            }, 2000);
          }
        }, 100);
      }
      return;
    }
    
    // Default behavior - navigate to the content tab
    setActiveTab('content');
    
    // Find the corresponding module
    const unit = units.find(u => u.id === unitId);
    if (unit) {
      // Scroll to the module section (in a real implementation)
      // For now we'll just set a timeout to simulate this
      setTimeout(() => {
        const moduleElement = document.getElementById(`module-${unit.moduleId}`);
        if (moduleElement) {
          moduleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Add a highlight animation
          moduleElement.classList.add('highlight-module');
          setTimeout(() => {
            moduleElement.classList.remove('highlight-module');
          }, 2000);
        }
      }, 100);
    }
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsEditing(true);
  };

  const handleUpdateUnit = async () => {
    if (!editingUnit || !user?.id || !courseId) {
      toast({
        title: "Error",
        description: "Unable to update unit information",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const studentId = parseInt(user.id);
      
      // In a real implementation, this would call an API endpoint
      // Here we're just updating the local state
      
      // Update the unit in the units state
      const updatedUnits = units.map(unit => 
        unit.id === editingUnit.id ? editingUnit : unit
      );
      setUnits(updatedUnits);
      
      toast({
        title: "Unit Updated",
        description: `${editingUnit.title} has been updated successfully`
      });
      
      // Reset editing state
      setEditingUnit(null);
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating unit:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || error.message || "Failed to update unit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingUnit(null);
    setIsEditing(false);
  };

  const handleSendNotes = async (unitId: string, notes: string) => {
    if (!notes.trim() || !user?.id || !course) return;
    
    try {
      const studentId = parseInt(user.id);
      
      // Send notes using the API (mock implementation)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      toast({
        title: "Notes Sent",
        description: "Your notes have been sent successfully",
      });
    } catch (error) {
      console.error('Error sending notes:', error);
      toast({
        title: "Error",
        description: "Failed to send notes. Please try again.",
        variant: "destructive"
      });
      throw error; // Re-throw to handle in the component
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <Bookmark className="h-4 w-4" />;
      case 'assignment':
        return <Book className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getColorClass = (colorName: string) => {
    switch(colorName) {
      case 'bg-blue-500':
        return {
          bg: 'bg-[#0062ff]/10',
          text: 'text-[#0062ff]',
          border: 'border-[#0062ff]',
          accent: '#0062ff'
        };
      case 'bg-purple-500':
        return {
          bg: 'bg-[#8b5cf6]/10',
          text: 'text-[#8b5cf6]',
          border: 'border-[#8b5cf6]',
          accent: '#8b5cf6'
        };
      case 'bg-green-500':
        return {
          bg: 'bg-[#00ffd0]/10',
          text: 'text-[#00ffd0]',
          border: 'border-[#00ffd0]',
          accent: '#00ffd0'
        };
      case 'bg-amber-500':
        return {
          bg: 'bg-[#ffcb6b]/10',
          text: 'text-[#ffcb6b]',
          border: 'border-[#ffcb6b]',
          accent: '#ffcb6b'
        };
      default:
        return {
          bg: 'bg-[#00ffd0]/10',
          text: 'text-[#00ffd0]',
          border: 'border-[#00ffd0]',
          accent: '#00ffd0'
        };
    }
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <Button 
          onClick={() => navigate('/student/courses')}
          className="bg-[#00ffd0] text-black hover:bg-[#00ffd0]/80"
        >
          Back to Courses
        </Button>
      </div>
    );
  }

  const colorClasses = getColorClass(course.color);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white pb-20">
      {/* Header */}
      <div className={`${course.color === 'bg-blue-500' ? 'bg-[#0062ff]/20' : 
                         course.color === 'bg-purple-500' ? 'bg-[#8b5cf6]/20' : 
                         course.color === 'bg-green-500' ? 'bg-[#00ffd0]/20' : 
                         'bg-[#ffcb6b]/20'} p-6`}>
        <Button
          variant="ghost"
          className="mb-4 text-white"
          onClick={() => navigate('/student/courses')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Button>
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Badge variant="outline" className="text-sm font-normal">
                  {course.code}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-300">
                  <Users className="h-4 w-4" />
                  <span>{course.students} students</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
              <p className="text-gray-300 mt-1">Instructor: {course.instructor}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-300">Progress: {course.progress}%</span>
                <Progress value={course.progress} className="w-[120px] bg-gray-700" />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Calendar className="h-4 w-4" />
                <span>Next class: {course.nextClass}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger 
              value="units" 
              className={activeTab === 'units' ? 'data-[state=active]:bg-[#00ffd0] data-[state=active]:text-black' : ''}
            >
              Units
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className={activeTab === 'content' ? 'data-[state=active]:bg-[#00ffd0] data-[state=active]:text-black' : ''}
            >
              Content
            </TabsTrigger>
            <TabsTrigger 
              value="discussion" 
              className={activeTab === 'discussion' ? 'data-[state=active]:bg-[#00ffd0] data-[state=active]:text-black' : ''}
            >
              Discussion
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className={activeTab === 'notes' ? 'data-[state=active]:bg-[#00ffd0] data-[state=active]:text-black' : ''}
            >
              Notes
            </TabsTrigger>
          </TabsList>

          {/* Units Tab */}
          <TabsContent value="units" className="space-y-6">
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-6">Course Units</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {units.map((unit, index) => (
                  <motion.div 
                    key={unit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <UnitCard
                      id={unit.id}
                      title={unit.title}
                      description={unit.description}
                      progress={unit.progress}
                      duration={unit.duration}
                      itemCount={unit.itemCount}
                      colorScheme={course?.color || 'bg-blue-500'}
                      completed={unit.completed}
                      studentsCount={0} // Not relevant for students view
                      showNotes={true} // Enable notes tab access
                      showDocuments={true} // Enable documents tab access
                      showAssignments={true} // Enable assignments tab access
                      onClick={handleUnitClick}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-6">Course Description</h2>
              <p className="text-gray-300">{course?.description}</p>
            </div>

            <div className="mt-8">
              {modules.map(module => (
                <div key={module.id} id={`module-${module.id}`} className="mb-8 p-4 rounded-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-4">{module.title}</h3>
                  <div className="space-y-3">
                    {module.items.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => handleContentItemClick(item.path)}
                        className="flex items-center justify-between p-4 bg-[#181818] rounded-lg cursor-pointer hover:bg-[#222] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            item.type === 'video' ? "bg-purple-500/20 text-purple-400" :
                            item.type === 'document' ? "bg-blue-500/20 text-blue-400" :
                            item.type === 'quiz' ? "bg-amber-500/20 text-amber-400" :
                            "bg-green-500/20 text-green-400"
                          )}>
                            {getContentIcon(item.type)}
                          </div>
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                              <span className="capitalize">{item.type}</span>
                              {item.duration && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {item.duration}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {item.completed ? (
                          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-none">
                            <Check className="h-4 w-4 mr-1" /> Completed
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline" className="text-white border-gray-700">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Discussion Tab */}
          <TabsContent value="discussion">
            <div className="bg-[#181818] p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-6">Course Discussion</h2>
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <MessageCircle className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-300">No discussions yet</h3>
                <p className="text-gray-400 mt-2">Start a conversation with your instructor or classmates</p>
                <Button className="mt-4 bg-[#00ffd0] text-black hover:bg-[#00ffd0]/80">
                  Start a Discussion
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <div className="bg-[#181818] p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-6">Course Notes from Lecturer</h2>
              
              {loadingNotes ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ffd0]"></div>
                </div>
              ) : notes && notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-[#222] rounded-lg border border-gray-800"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-[#00ffd0]">{course.code} - Notes</h3>
                        <div className="text-xs text-gray-400">
                          {new Date(note.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <Book className="h-12 w-12 text-gray-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300">No notes yet</h3>
                  <p className="text-gray-400 mt-2">
                    When your lecturer sends notes for this course, they will appear here
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Unit Modal */}
      {isEditing && editingUnit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] rounded-xl p-6 w-full max-w-md relative border border-gray-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Unit</h2>
              <Button
                variant="ghost"
                onClick={cancelEdit}
                className="p-2 hover:bg-gray-800 rounded-lg"
                disabled={loading}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Unit Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingUnit.title}
                  onChange={(e) => setEditingUnit({...editingUnit, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  placeholder="e.g., Introduction Module"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={editingUnit.description}
                  onChange={(e) => setEditingUnit({...editingUnit, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  placeholder="Enter a description for the unit"
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={loading}
                  className="flex-1 border-gray-700"
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleUpdateUnit}
                  disabled={loading || !editingUnit.title.trim()}
                  className="flex-1 bg-[#00ffd0] hover:bg-[#00e0b8] text-black py-2 rounded-lg transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                      Updating...
                    </span>
                  ) : (
                    "Update Unit"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add stylesheet for module highlighting */}
      <style>
        {`
          .highlight-module {
            background-color: rgba(0, 255, 208, 0.1);
            box-shadow: 0 0 15px rgba(0, 255, 208, 0.3);
          }
        `}
      </style>
    </div>
  );
};

export default StudentCourseDetail; 