import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import BottomNav from '../../components/BottomNav';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Export the storage key for use in dashboard
export const LOCAL_STORAGE_KEY = 'timetable_lessons';

// Day type for the timetable
type Day = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';

interface Lesson {
  id: string;
  subject: string;
  time: string;
  venue: string;
  lecturer: string;
}

interface DayLessons {
  [key: string]: Lesson[];
}

const StudentTimetable: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<Day>(() => {
    const today = new Date().getDay();
    const dayMap: Record<number, Day> = {
      1: 'MON',
      2: 'TUE',
      3: 'WED',
      4: 'THU',
      5: 'FRI',
    };
    return dayMap[today] || 'MON';
  });
  
  const [timetable, setTimetable] = useState<DayLessons>({
    MON: [],
    TUE: [],
    WED: [],
    THU: [],
    FRI: []
  });

  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLesson, setNewLesson] = useState<Omit<Lesson, 'id'>>({
    subject: '',
    time: '',
    venue: '',
    lecturer: ''
  });

  useEffect(() => {
    const loadTimetable = () => {
      const savedLessons = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      if (savedLessons) {
        try {
          const parsed = JSON.parse(savedLessons);
          // Ensure all days exist in the loaded data
          const completeData = {
            MON: [],
            TUE: [],
            WED: [],
            THU: [],
            FRI: [],
            ...parsed
          };
          setTimetable(completeData);
        } catch (error) {
          console.error('Error loading saved timetable:', error);
          // Load demo data if there's an error
          loadDemoData();
        }
      } else {
        // Load demo data if no saved data exists
        loadDemoData();
      }
      setLoading(false);
    };

    const loadDemoData = () => {
      const demoData = {
        MON: [
          { id: '1', subject: 'Introduction to Programming', time: '09:00-10:30', venue: 'Lab 204', lecturer: 'Dr. Johnson' },
          { id: '2', subject: 'Computer Networks', time: '11:00-12:30', venue: 'Lecture Hall A', lecturer: 'Prof. Martinez' }
        ],
        TUE: [
          { id: '3', subject: 'Database Systems', time: '10:00-11:30', venue: 'Lab 301', lecturer: 'Dr. Williams' },
          { id: '4', subject: 'Software Engineering', time: '14:00-15:30', venue: 'Lecture Hall B', lecturer: 'Prof. Garcia' }
        ],
        WED: [
          { id: '5', subject: 'Data Structures', time: '09:00-10:30', venue: 'Lab 204', lecturer: 'Dr. Johnson' },
          { id: '6', subject: 'Operating Systems', time: '13:00-14:30', venue: 'Lecture Hall C', lecturer: 'Dr. Smith' }
        ],
        THU: [
          { id: '7', subject: 'Web Development', time: '11:00-12:30', venue: 'Lab 305', lecturer: 'Prof. Wilson' },
          { id: '8', subject: 'Mobile App Development', time: '15:00-16:30', venue: 'Lab 204', lecturer: 'Dr. Brown' }
        ],
        FRI: [
          { id: '9', subject: 'Artificial Intelligence', time: '10:00-11:30', venue: 'Lecture Hall A', lecturer: 'Prof. Taylor' },
          { id: '10', subject: 'Machine Learning', time: '13:00-14:30', venue: 'Lab 304', lecturer: 'Dr. Davis' }
        ]
      };
      setTimetable(demoData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoData));
    };

    loadTimetable();
  }, []);

  // Save timetable to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(timetable));
    }
  }, [timetable, loading]);

  const handleDayClick = (day: Day) => {
    setSelectedDay(day);
  };

  // Update handleDeleteLesson to ensure proper data persistence
  const handleDeleteLesson = (lessonId: string) => {
    setTimetable(prev => {
      const newTimetable = { ...prev };
      for (const day of Object.keys(newTimetable) as Day[]) {
        newTimetable[day] = newTimetable[day].filter(lesson => lesson.id !== lessonId);
      }
      // Save to localStorage immediately
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTimetable));
      return newTimetable;
    });
  };

  // Get the full day name
  const getDayFullName = (day: Day): string => {
    const dayMap: Record<Day, string> = {
      MON: 'Monday',
      TUE: 'Tuesday',
      WED: 'Wednesday',
      THU: 'Thursday',
      FRI: 'Friday'
    };
    return dayMap[day];
  };

  // Determine if a lesson is currently active, upcoming, or past
  const getLessonStatus = (timeRange: string): 'active' | 'upcoming' | 'past' => {
    const now = new Date();
    const [startTime, endTime] = timeRange.split('-');
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const lessonStart = new Date();
    lessonStart.setHours(startHour, startMinute, 0);
    
    const lessonEnd = new Date();
    lessonEnd.setHours(endHour, endMinute, 0);
    
    if (now < lessonStart) return 'upcoming';
    if (now > lessonEnd) return 'past';
    return 'active';
  };

  // Update handleAddLesson to ensure proper data persistence
  const handleAddLesson = () => {
    if (!newLesson.subject || !newLesson.time || !newLesson.venue || !newLesson.lecturer) {
      return;
    }

    const newLessonWithId = {
      ...newLesson,
      id: Date.now().toString()
    };

    setTimetable(prev => {
      // Sort lessons by time for consistent display
      const updatedDayLessons = [...prev[selectedDay], newLessonWithId].sort((a, b) => {
        const [aStart] = a.time.split('-');
        const [bStart] = b.time.split('-');
        return aStart.localeCompare(bStart);
      });

      const newTimetable = {
        ...prev,
        [selectedDay]: updatedDayLessons
      };
      
      // Save to localStorage immediately
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTimetable));
      return newTimetable;
    });

    setNewLesson({
      subject: '',
      time: '',
      venue: '',
      lecturer: ''
    });
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white pb-20">
      <Header />
      
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/student/dashboard')}
            className="mr-2 p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">Weekly Timetable</h1>
        </div>
        
        {/* Day selector */}
        <div className="flex overflow-x-auto pb-2 mb-6 hide-scrollbar">
          <div className="flex space-x-2">
            {(['MON', 'TUE', 'WED', 'THU', 'FRI'] as Day[]).map((day) => (
              <motion.button
                key={day}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDayClick(day)}
                className={`px-4 py-2 rounded-lg flex-shrink-0 transition-colors ${
                  selectedDay === day 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {day}
              </motion.button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-1">{getDayFullName(selectedDay)}</h2>
          <p className="text-gray-400 text-sm">
            {timetable[selectedDay].length} classes scheduled
          </p>
        </div>
        
        {/* Lessons for the selected day */}
        <div className="space-y-4">
          {timetable[selectedDay].length > 0 ? (
            timetable[selectedDay].map((lesson) => {
              const status = getLessonStatus(lesson.time);
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border relative ${
                    status === 'active' ? 'border-green-500 bg-green-500/10' :
                    status === 'upcoming' ? 'border-blue-500 bg-blue-500/10' :
                    'border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{lesson.subject}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        status === 'active' ? 'bg-green-500/20 text-green-400' :
                        status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(lesson.id);
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-indigo-400" />
                      <span>{lesson.time}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-purple-400" />
                      <span>{lesson.venue}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 col-span-2">
                      <Users size={16} className="text-blue-400" />
                      <span>{lesson.lecturer}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-gray-800/30 backdrop-blur-lg rounded-xl">
              <Calendar className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300">No Classes Scheduled</h3>
              <p className="text-gray-500 mt-2">Enjoy your free day!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Add Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-6 p-4 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors z-50 animate-bounce"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add Lesson Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add New Lesson</h2>
              <Button
                variant="ghost"
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={newLesson.subject}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Time</label>
                <input
                  type="text"
                  value={newLesson.time}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., 09:00-10:30"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Venue</label>
                <input
                  type="text"
                  value={newLesson.venue}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., Room 101"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Lecturer</label>
                <input
                  type="text"
                  value={newLesson.lecturer}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, lecturer: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., Dr. Smith"
                />
              </div>

              <Button
                onClick={handleAddLesson}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors"
              >
                Add Lesson
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default StudentTimetable;
