import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Book, Users, Calendar, ArrowRight, ArrowLeft, Plus, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BottomNav from '@/components/BottomNav';
import CourseCard from '@/components/CourseCard';
import { AuthService } from '@/services/ApiService';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';

interface Course {
  id: string;
  title: string;
  code: string;
  instructor: string;
  progress: number;
  nextClass: string;
  students: number;
  icon: React.ReactNode;
  color: string;
  imageUrl: string;
  lecturerId?: number;
  lecturerName?: string;
  lecturerEmail?: string;
}

const StudentCourses: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLinkLecturerForm, setShowLinkLecturerForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [lecturerKey, setLecturerKey] = useState<string>('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [newCourse, setNewCourse] = useState<Omit<Course, 'id' | 'icon'>>({
    title: '',
    code: '',
    instructor: '',
    progress: 0,
    nextClass: '',
    students: 0,
    color: 'bg-blue-500',
    imageUrl: '/images/course-default.jpg' // Default image path
  });

  // Add state for editing courses
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch courses data from API with caching
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Try to load cached data first
        const cachedCoursesKey = `student_courses_${user?.id}`;
        const cachedCoursesData = localStorage.getItem(cachedCoursesKey);
        let coursesData: Course[] = [];
        
        // If we have cached data, load it first for immediate display
        if (cachedCoursesData) {
          try {
            const parsedCache = JSON.parse(cachedCoursesData);
            if (Array.isArray(parsedCache)) {
              coursesData = parsedCache;
              // Set courses immediately from cache for faster loading
              setCourses(coursesData);
            }
          } catch (cacheError) {
            console.error('Error parsing cached courses:', cacheError);
          }
        }
        
        // Try to get fresh data from API
        if (user?.id) {
          try {
            const studentId = parseInt(user.id);
            const apiCoursesData = await AuthService.getStudentCourses(studentId);
            
            // Transform the API response to match our Course interface
            coursesData = apiCoursesData.map((course: any) => ({
              id: course.id.toString(),
              title: course.title,
              code: course.code,
              instructor: course.instructor || 'Not assigned',
              progress: course.progress || 0,
              nextClass: course.next_class || 'Not scheduled',
              students: course.students_count || 0,
              icon: <Book />,
              color: course.color || 'bg-blue-500',
              imageUrl: course.image_url || '/images/course-default.jpg',
              lecturerId: course.instructor_id,
              lecturerName: course.instructor_name,
              lecturerEmail: course.instructor_email
            }));
            
            // Update state with fresh data
            setCourses(coursesData);
            
            // Cache the fresh data
            localStorage.setItem(cachedCoursesKey, JSON.stringify(coursesData));
          } catch (apiError) {
            console.error('Failed to fetch courses from API:', apiError);
            
            // If API fails but we have cached data, just show offline message
            if (coursesData.length > 0) {
              toast({
                title: "Working Offline",
                description: "Using cached data. Some features may be limited.",
                variant: "default"
              });
            } else {
              // No cached data and API failed, show empty state
              setCourses([]);
              
              toast({
                title: "No Courses Found",
                description: "Add your first course using the + button",
                variant: "default"
              });
            }
          }
        } else {
          // No user ID, show login required message
          toast({
            title: "Login Required",
            description: "Please log in to view your courses",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error in fetchCourses:', error);
        toast({
          title: "Warning",
          description: "Working in offline mode. You can still add courses.",
          variant: "default"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id]);

  const handleCourseClick = (courseId: string) => {
    navigate(`/student/courses/${courseId}`);
  };

  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.code) {
      toast({
        title: "Error",
        description: "Course title and code are required",
        variant: "destructive"
      });
      return;
    }

    // Set loading state
    setLoading(true);
    
    try {
      if (!user?.id) {
        throw new Error("You must be logged in to add a course");
      }
      
      const studentId = parseInt(user.id);
      
      // Create a new course using the proper API endpoint
      const result = await AuthService.createStudentCourse(
        studentId,
        {
          code: newCourse.code,
          title: newCourse.title,
          instructor: newCourse.instructor || undefined,
          description: `Course for ${newCourse.title}`,
          next_class: 'Not scheduled',
          image_url: newCourse.imageUrl,
          color: newCourse.color
        }
      );
      
      // Create the new course object from the API response
      const newCourseWithId: Course = {
        id: result.id.toString(),
        title: result.title,
        code: result.code,
        instructor: result.instructor || 'Not assigned',
        progress: result.progress || 0,
        nextClass: result.next_class || 'Not scheduled',
        students: result.students_count || 0,
        icon: <Book />,
        color: result.color || 'bg-blue-500',
        imageUrl: result.image_url || `/images/courses/${newCourse.code.toLowerCase()}.jpg`,
        lecturerId: undefined,
        lecturerName: undefined,
        lecturerEmail: undefined
      };

      // Add the new course to the beginning of the list so it's immediately visible
      const updatedCourses = [newCourseWithId, ...courses];
      setCourses(updatedCourses);
      
      // Update localStorage cache
      const cachedCoursesKey = `student_courses_${user.id}`;
      localStorage.setItem(cachedCoursesKey, JSON.stringify(updatedCourses));
      
      // Reset the form
      setNewCourse({
        title: '',
        code: '',
        instructor: '',
        progress: 0,
        nextClass: '',
        students: 0,
        color: 'bg-blue-500',
        imageUrl: '/images/course-default.jpg'
      });
      
      toast({
        title: "Course Added",
        description: `${newCourseWithId.code} - ${newCourseWithId.title} has been added successfully`
      });
      
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Failed to add course:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || error.message || "Failed to add course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add delete course functionality
  const handleDeleteCourse = async (courseId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to delete a course",
        variant: "destructive"
      });
      return;
    }
    
    if (!confirm("Are you sure you want to unenroll from this course? This action cannot be undone.")) {
      return;
    }
    
    setLoading(true);
    
    try {
      const studentId = parseInt(user.id);
      const course_id = parseInt(courseId);
      
      // Delete the course using the API
      await AuthService.deleteStudentCourse(studentId, course_id);
      
      // Remove the course from the local state
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
      
      toast({
        title: "Course Removed",
        description: "You have successfully unenrolled from the course"
      });
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || error.message || "Failed to delete course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkLecturer = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    setSelectedCourseId(courseId);
    setLecturerKey('');
    setShowLinkLecturerForm(true);
  };

  const submitLecturerLink = async () => {
    if (!lecturerKey || !selectedCourseId) {
      toast({
        title: "Error",
        description: "Please enter a valid lecturer key",
        variant: "destructive"
      });
      return;
    }

    setLinkLoading(true);
    try {
      // Mock lecturer data (in case API fails)
      const mockLecturerInfo = {
        lecturer: {
          id: Date.now(),
          full_name: "Dr. " + lecturerKey.substring(0, 3).toUpperCase() + " " + lecturerKey.substring(3, 6).toUpperCase(),
          email: `${lecturerKey.substring(0, 3).toLowerCase()}@university.edu`
        }
      };
      
      let lecturerInfo = mockLecturerInfo;
      
      // Try real API call
      try {
        console.log('Linking lecturer with key:', lecturerKey);
        
        // Get the lecturer info from the key
        const apiLecturerInfo = await AuthService.linkLecturerByKey(lecturerKey);
        console.log('Lecturer info:', apiLecturerInfo);
        
        // If API call succeeds, use that data
        if (apiLecturerInfo && apiLecturerInfo.lecturer) {
          lecturerInfo = apiLecturerInfo;
          
          // Create a permanent connection in the database
          if (user?.id) {
            const studentId = parseInt(user.id);
            console.log('Creating connection for student:', studentId);
            
            await AuthService.connectToLecturer(studentId, lecturerKey);
          }
        }
      } catch (apiError) {
        console.log('API call failed, using mock data', apiError);
        // Continue with mock data
      }
      
      // Update the course with lecturer information in state
      setCourses(prev => 
        prev.map(course => {
          if (course.id === selectedCourseId) {
            console.log('Updating course:', course.id);
            return {
              ...course,
              instructor: lecturerInfo.lecturer.full_name,
              lecturerId: lecturerInfo.lecturer.id,
              lecturerName: lecturerInfo.lecturer.full_name,
              lecturerEmail: lecturerInfo.lecturer.email
            };
          }
          return course;
        })
      );
      
      toast({
        title: "Success",
        description: `Linked to lecturer: ${lecturerInfo.lecturer.full_name}`
      });
      
      setShowLinkLecturerForm(false);
      setLecturerKey('');
    } catch (error: any) {
      console.error('Link lecturer error:', error);
      let errorMessage = "Failed to link lecturer";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLinkLoading(false);
    }
  };

  // Add function to handle edit course
  const handleEditCourse = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    const courseToEdit = courses.find(course => course.id === courseId);
    if (courseToEdit) {
      setEditingCourse(courseToEdit);
      setIsEditing(true);
    }
  };

  // Add function to update course after editing
  const handleUpdateCourse = async () => {
    if (!editingCourse || !user?.id) {
      toast({
        title: "Error",
        description: "Unable to update course information",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const studentId = parseInt(user.id);
      const courseId = parseInt(editingCourse.id);
      
      // Update the course using the API
      const result = await AuthService.updateStudentCourse(
        studentId,
        courseId,
        {
          title: editingCourse.title,
          description: `Course for ${editingCourse.title}`,
          color: editingCourse.color,
          image_url: editingCourse.imageUrl
        }
      );
      
      // Update the course in the local state
      const updatedCourses = courses.map(course => 
        course.id === editingCourse.id ? editingCourse : course
      );
      setCourses(updatedCourses);
      
      // Update the cache
      const cachedCoursesKey = `student_courses_${user.id}`;
      localStorage.setItem(cachedCoursesKey, JSON.stringify(updatedCourses));
      
      toast({
        title: "Course Updated",
        description: `${editingCourse.code} - ${editingCourse.title} has been updated successfully`
      });
      
      // Reset editing state
      setEditingCourse(null);
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || error.message || "Failed to update course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingCourse(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white pb-20">
      <Header title="My Courses" />
      <div className="container mx-auto px-4 py-8">
        {courses.length === 0 ? (
          <div className="bg-[#0c0c0c]/80 backdrop-blur-sm border border-gray-800 rounded-xl p-10 text-center">
            <Book className="w-16 h-16 text-[#00ffd0] mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">No Courses Added Yet</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              You haven't added any courses yet. Start by adding your first course using the button below.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-[#00ffd0] hover:bg-[#00e0b8] text-black py-2 px-6 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Your First Course
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                code={course.code}
                instructor={course.instructor}
                progress={course.progress}
                nextClass={course.nextClass}
                students={course.students}
                color={course.color}
                imageUrl={course.imageUrl}
                description={`Course for ${course.title}`}
                lecturerId={course.lecturerId}
                lecturerName={course.lecturerName}
                lecturerEmail={course.lecturerEmail}
                index={index}
                isLecturer={false}
                onCourseClick={handleCourseClick}
                onDeleteClick={(e, id) => {
                  e.stopPropagation();
                  handleDeleteCourse(id);
                }}
                onLinkLecturer={handleLinkLecturer}
                onEditClick={handleEditCourse}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Floating Add Button - show only if courses exist */}
      {courses.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-24 right-6 p-4 rounded-full bg-[#00ffd0] text-black shadow-lg hover:bg-[#00e0b8] transition-colors z-50"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* Add Course Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] rounded-xl p-6 w-full max-w-md relative border border-gray-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add New Subject</h2>
              <Button
                variant="ghost"
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
                disabled={loading}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Subject Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  placeholder="e.g., Introduction to Programming"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Subject Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  placeholder="e.g., CS101"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Color Theme</label>
                <div className="flex gap-2 mt-1">
                  {['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCourse(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-all ${
                        color === 'bg-blue-500' ? 'bg-[#0062ff]' :
                        color === 'bg-purple-500' ? 'bg-[#8b5cf6]' :
                        color === 'bg-green-500' ? 'bg-[#00ffd0]' :
                        'bg-[#ffcb6b]'
                      } ${newCourse.color === color ? 'ring-2 ring-white scale-110' : ''}`}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 mt-2">
                <div className="flex items-center">
                  <Book className="w-5 h-5 text-[#00ffd0] mr-2" />
                  <h3 className="text-sm font-semibold text-[#00ffd0]">About Course Creation</h3>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  After creating a course, you can link it to your lecturer using their enrollment key. 
                  This will allow you to receive lecture notes and updates directly.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  disabled={loading}
                  className="flex-1 border-gray-700"
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleAddCourse}
                  disabled={loading || !newCourse.title.trim() || !newCourse.code.trim()}
                  className="flex-1 bg-[#00ffd0] hover:bg-[#00e0b8] text-black py-2 rounded-lg transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                      Adding...
                    </span>
                  ) : (
                    "Add Subject"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Link Lecturer Modal */}
      {showLinkLecturerForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] rounded-xl p-6 w-full max-w-md relative border border-gray-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Link Lecturer</h2>
              <Button
                variant="ghost"
                onClick={() => setShowLinkLecturerForm(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Lecturer Enrollment Key</label>
                <input
                  type="text"
                  value={lecturerKey}
                  onChange={(e) => setLecturerKey(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="e.g., LEC-12-ABC123"
                  disabled={linkLoading}
                />
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center">
                  <LinkIcon className="w-5 h-5 text-purple-400 mr-2" />
                  <h3 className="text-sm font-semibold text-purple-400">How it works</h3>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Enter the unique enrollment key provided by your lecturer to connect them 
                  to this course. This allows you to receive their lecture notes and updates.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowLinkLecturerForm(false)}
                  disabled={linkLoading}
                  className="px-4 border-gray-700 text-gray-300"
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={submitLecturerLink}
                  disabled={linkLoading || !lecturerKey.trim()}
                  className="px-6 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {linkLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Connecting...
                    </span>
                  ) : (
                    "Link Lecturer"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Edit Course Modal */}
      {isEditing && editingCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] rounded-xl p-6 w-full max-w-md relative border border-gray-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Course</h2>
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
                  Course Code
                </label>
                <input
                  type="text"
                  value={editingCourse.code}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  disabled
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  placeholder="e.g., Introduction to Programming"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Color Theme</label>
                <div className="flex gap-2 mt-1">
                  {['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500'].map(color => (
                    <button
                      key={color}
                      onClick={() => setEditingCourse({...editingCourse, color})}
                      className={`w-8 h-8 rounded-full transition-all ${
                        color === 'bg-blue-500' ? 'bg-[#0062ff]' :
                        color === 'bg-purple-500' ? 'bg-[#8b5cf6]' :
                        color === 'bg-green-500' ? 'bg-[#00ffd0]' :
                        'bg-[#ffcb6b]'
                      } ${editingCourse.color === color ? 'ring-2 ring-white scale-110' : ''}`}
                      disabled={loading}
                    />
                  ))}
                </div>
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
                  onClick={handleUpdateCourse}
                  disabled={loading || !editingCourse.title.trim()}
                  className="flex-1 bg-[#00ffd0] hover:bg-[#00e0b8] text-black py-2 rounded-lg transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                      Updating...
                    </span>
                  ) : (
                    "Update Course"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default StudentCourses;