import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useAutoLock } from '../../hooks/useAutoLock';
import { Header } from '@/components/Header';
import MetricCard from '../../components/MetricCard';
import TimelineItem from '../../components/TimelineItem';
import AssignmentsSection from '../../components/AssignmentsSection';
import { Calendar, Target, CreditCard, Award, TrendingUp, BookOpen, Coffee, Clock, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LOCAL_STORAGE_KEY } from './StudentTimetable';

// Add constant for planner storage key
const PLANNER_STORAGE_KEY = 'STUDENT_PLANNER_DATA';

interface DashboardMetric {
  value: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  progress?: number;
}

interface ScheduleItem {
  text: string;
  time: string;
  status: 'upcoming' | 'past' | 'urgent';
  location?: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  status: 'upcoming' | 'urgent' | 'important';
  progress?: number;
  description?: string;
}

interface TimetableLesson {
  id: string;
  subject: string;
  time: string;
  venue: string;
  lecturer: string;
}

interface DayLessons {
  [key: string]: TimetableLesson[];
}

// Add interface for planner items
interface PlannerItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'study' | 'assignment' | 'exam' | 'meeting' | 'other';
  completed: boolean;
}

interface DashboardData {
  metrics: DashboardMetric[];
  schedule: ScheduleItem[];
  assignments: Assignment[];
  streak: number;
  plannerItems?: PlannerItem[]; // Add plannerItems to dashboard data
}

// Add function to calculate deadline status
const getDeadlineStatus = (deadline: string): 'urgent' | 'upcoming' | 'important' => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilDeadline <= 24) return 'urgent';
  if (hoursUntilDeadline <= 72) return 'important';
  return 'upcoming';
};

// Add function to format remaining time
const getRemainingTime = (deadline: string): string => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilDeadline <= 24) {
    const hours = Math.floor(hoursUntilDeadline);
    return `${hours} hour${hours !== 1 ? 's' : ''} left`;
  }
  
  const days = Math.floor(hoursUntilDeadline / 24);
  return `${days} day${days !== 1 ? 's' : ''} left`;
};

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('today');
  const [timetableData, setTimetableData] = useState<DayLessons>({
    MON: [],
    TUE: [],
    WED: [],
    THU: [],
    FRI: []
  });
  useAutoLock();

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    metrics: [],
    streak: 5,
    schedule: [
      { text: "Introduction to Algorithms", time: "09:00 - 10:30", status: "upcoming", location: "Room 205" },
      { text: "Database Management", time: "11:00 - 12:30", status: "urgent", location: "Computer Lab" },
      { text: "Coffee Break", time: "12:30 - 14:00", status: "upcoming", location: "Cafeteria" },
      { text: "Web Development", time: "14:00 - 15:30", status: "upcoming", location: "Room 301" }
    ],
    assignments: [
      { 
        id: "1",
        title: "Cloud Architecture Design", 
        subject: "Cloud Computing", 
        deadline: "2025-08-02", 
        status: "upcoming",
        progress: 65
      },
      { 
        id: "2",
        title: "Network Security Analysis", 
        subject: "Cybersecurity", 
        deadline: "2025-02-11", 
        status: "urgent",
        progress: 30
      },
      { 
        id: "3",
        title: "Database Optimization", 
        subject: "Database Management", 
        deadline: "2025-02-13", 
        status: "important",
        progress: 80
      }
    ]
  });

  // Add function to get current day's key
  const getCurrentDayKey = (): string => {
    const today = new Date().getDay();
    const dayMap: Record<number, string> = {
      1: 'MON',
      2: 'TUE',
      3: 'WED',
      4: 'THU',
      5: 'FRI'
    };
    return dayMap[today] || 'MON';
  };

  // Update useEffect to load timetable data
  useEffect(() => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to view your dashboard",
        variant: "destructive"
      });
      navigate("/");
      return;
    }
    
    const fetchData = async () => {
      try {
        // Load timetable data from localStorage
        const savedLessons = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedLessons) {
          const parsedTimetable = JSON.parse(savedLessons);
          setTimetableData(parsedTimetable);
          
          // Convert timetable lessons to schedule items
          const currentDayKey = getCurrentDayKey();
          const currentDayLessons = parsedTimetable[currentDayKey] || [];
          
          const scheduleItems: ScheduleItem[] = currentDayLessons.map((lesson: TimetableLesson) => ({
            text: lesson.subject,
            time: lesson.time,
            status: determineStatus(lesson.time),
            location: lesson.venue
          }));
          
          setDashboardData(prev => ({
            ...prev,
            schedule: scheduleItems
          }));
        }
        
        // Load planner data from localStorage
        const savedPlanner = localStorage.getItem(PLANNER_STORAGE_KEY);
        if (savedPlanner) {
          try {
            const parsedPlanner = JSON.parse(savedPlanner);
            // Get only upcoming and non-completed items
            const today = new Date();
            const upcomingItems = parsedPlanner
              .filter((item: PlannerItem) => {
                const itemDate = new Date(item.date);
                return !item.completed && 
                  (itemDate.toDateString() === today.toDateString() || 
                   itemDate > today);
              })
              .sort((a: PlannerItem, b: PlannerItem) => {
                // Sort by date first, then by time
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                if (dateA.getTime() !== dateB.getTime()) {
                  return dateA.getTime() - dateB.getTime();
                }
                return a.time.localeCompare(b.time);
              })
              .slice(0, 3); // Get only the next 3 items
            
            setDashboardData(prev => ({
              ...prev,
              plannerItems: upcomingItems
            }));
          } catch (e) {
            console.error('Error parsing planner data', e);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, navigate]);

  // Update the tab change handler to load correct day's lessons
  const handleDayTabChange = (day: string) => {
    setSelectedTab(day);
    
    // Convert day name to timetable key
    const dayKeyMap: Record<string, string> = {
      'today': getCurrentDayKey(),
      'tomorrow': (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDay = tomorrow.getDay();
        const dayMap: Record<number, string> = {
          1: 'MON',
          2: 'TUE',
          3: 'WED',
          4: 'THU',
          5: 'FRI'
        };
        return dayMap[tomorrowDay] || 'MON';
      })(),
      'Monday': 'MON',
      'Tuesday': 'TUE',
      'Wednesday': 'WED',
      'Thursday': 'THU',
      'Friday': 'FRI'
    };
    
    const dayKey = dayKeyMap[day];
    if (dayKey && timetableData[dayKey]) {
      const scheduleItems: ScheduleItem[] = timetableData[dayKey].map(lesson => ({
        text: lesson.subject,
        time: lesson.time,
        status: determineStatus(lesson.time),
        location: lesson.venue
      }));
      
      setDashboardData(prev => ({
        ...prev,
        schedule: scheduleItems
      }));
    }
  };

  // Helper function to determine lesson status
  const determineStatus = (time: string): 'upcoming' | 'past' | 'urgent' => {
    const [startTime] = time.split('-');
    const [hours, minutes] = startTime.trim().split(':').map(Number);
    const lessonTime = new Date();
    lessonTime.setHours(hours, minutes, 0);
    
    const now = new Date();
    const timeDiff = lessonTime.getTime() - now.getTime();
    
    if (timeDiff < 0) return 'past';
    if (timeDiff <= 30 * 60 * 1000) return 'urgent'; // Within 30 minutes
    return 'upcoming';
  };

  // Get day of week name
  const getDayName = (offset = 0) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const targetDay = new Date(today);
    targetDay.setDate(today.getDate() + offset);
    return days[targetDay.getDay()];
  };

  // Get motivational quote
  const getMotivationalQuote = () => {
    const quotes = [
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "The only way to do great work is to love what you do.",
      "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "Your time is limited, don't waste it living someone else's life."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-2 border-b-2 border-[#00ffd0] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[#00ffd0] text-sm font-medium">
            Loading
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-gray-200"
    >
      <Header title="Dashboard" />
      <div className="container mx-auto px-4">
        <div className="space-y-6 px-4 pt-4">
          <div className="space-y-6 max-w-7xl mx-auto">
            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {dashboardData.metrics.map((metric, index) => (
                <div 
                  key={index}
                  onClick={() => navigate(
                    metric.label === 'Attendance' ? '/student/attendance' :
                    metric.label === 'Fee balance' ? '/student/fee-payment' :
                    metric.label === 'Study Streak' ? '/student/progress' :
                    '/student/achievements'
                  )}
                  className="bg-[#0c0c0c] border border-gray-800 rounded-xl p-4 cursor-pointer hover:bg-[#151515] transition-all shadow-lg flex flex-col justify-between h-32 group relative overflow-hidden"
                >
                  {/* Subtle glow effect on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    metric.label === 'Attendance' ? 'bg-[#00ffd0]/5' : 
                    metric.label === 'Fee balance' ? 'bg-[#ff5555]/5' :
                    metric.label === 'Study Streak' ? 'bg-[#ffcb6b]/5' :
                    'bg-[#8b5cf6]/5'
                  } blur-md`}></div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className={`p-2 rounded-lg ${
                      metric.label === 'Attendance' ? 'bg-[#00ffd0]/10' : 
                      metric.label === 'Fee balance' ? 'bg-[#ff5555]/10' :
                      metric.label === 'Study Streak' ? 'bg-[#ffcb6b]/10' :
                      'bg-[#8b5cf6]/10'
                    }`}>
                      {metric.icon}
                    </div>
                    {metric.progress && (
                      <div className="h-8 w-8">
                        <div className="relative h-full w-full">
                          <svg className="h-full w-full" viewBox="0 0 36 36">
                            <circle 
                              cx="18" 
                              cy="18" 
                              r="16" 
                              fill="none" 
                              stroke="#222222" 
                              strokeWidth="3" 
                            />
                            <circle 
                              cx="18" 
                              cy="18" 
                              r="16" 
                              fill="none" 
                              stroke={
                                metric.label === 'Attendance' ? '#00ffd0' : 
                                metric.label === 'Study Streak' ? '#ffcb6b' : 
                                '#8b5cf6'
                              } 
                              strokeWidth="3" 
                              strokeDasharray={`${metric.progress} 100`}
                              strokeLinecap="round"
                              transform="rotate(-90 18 18)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300">
                            {Math.round(metric.progress)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative z-10">
                    <div className={`text-lg font-bold ${
                      metric.label === 'Attendance' ? 'text-[#00ffd0]' : 
                      metric.label === 'Fee balance' ? 'text-[#ff5555]' :
                      metric.label === 'Study Streak' ? 'text-[#ffcb6b]' :
                      'text-[#8b5cf6]'
                    } group-hover:scale-105 transition-transform duration-300`}>{metric.value}</div>
                    <div className="text-xs text-gray-500">{metric.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
            
            <motion.div 
              className="relative backdrop-blur-2xl rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* Glass background with multiple layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c]/90 to-black/90 rounded-xl"></div>
              <div className="absolute inset-0 backdrop-blur-xl bg-black/20"></div>
              <div className="absolute inset-0 border border-gray-800 rounded-xl"></div>
              
              {/* Gradient orbs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00ffd0]/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#0062ff]/5 rounded-full blur-3xl animate-pulse delay-700"></div>
              
              <div className="relative p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Clock size={20} className="text-[#00ffd0]" />
                    Schedule
                  </h2>
                  <button 
                    onClick={() => navigate('/student/timetable')}
                    className="text-xs px-3 py-1.5 bg-black/50 hover:bg-[#00ffd0]/10 rounded-lg transition-all flex items-center gap-2 backdrop-blur-xl shadow-sm shadow-[#00ffd0]/5 hover:text-[#00ffd0] border border-gray-800 hover:border-[#00ffd0]/20"
                  >
                    Full Schedule
                    <Calendar size={14} />
                  </button>
                </div>
                
                <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                  {['today', 'tomorrow', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => (
                    <button
                      key={day}
                      className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-sm ${
                        selectedTab === day 
                          ? 'bg-[#00ffd0] text-black' 
                          : 'bg-[#151515] text-gray-300 hover:bg-[#1d1d1d] border border-gray-800'
                      }`}
                      onClick={() => handleDayTabChange(day)}
                    >
                      {index === 0 ? 'Today' : 
                       index === 1 ? 'Tomorrow' : day}
                    </button>
                  ))}
                </div>
                
                <p className="text-gray-500 mb-4 text-sm">
                  {selectedTab === 'today' 
                   ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                   : selectedTab === 'tomorrow'
                   ? new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                   : selectedTab}
                </p>
                
                <div className="space-y-2">
                  {dashboardData.schedule.map((item, index) => (
                    <div 
                      key={index}
                      onClick={() => navigate('/student/timetable')}
                      className="group cursor-pointer bg-[#151515] hover:bg-[#1d1d1d] rounded-lg transition-all p-3 border border-gray-800 backdrop-blur-md relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ffd0]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                      <div className="relative flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{item.text}</h3>
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <Clock size={12} className="mr-1" /> {item.time}
                            {item.location && (
                              <span className="ml-2">• {item.location}</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.status === 'urgent' ? 'bg-[#ff5555]/20 text-[#ff5555]' :
                            item.status === 'upcoming' ? 'bg-[#00ffd0]/20 text-[#00ffd0]' :
                            'bg-gray-700/50 text-gray-400'
                          }`}>
                            {item.status === 'urgent' ? 'Soon' : 
                             item.status === 'upcoming' ? 'Upcoming' : 'Past'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {dashboardData.schedule.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      <Coffee size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No classes for this day. Enjoy your free time!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="relative backdrop-blur-2xl rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {/* Glass background with multiple layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c]/90 to-black/90 rounded-xl"></div>
              <div className="absolute inset-0 backdrop-blur-xl bg-black/20"></div>
              <div className="absolute inset-0 border border-gray-800 rounded-xl"></div>
              
              {/* Gradient orbs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#0062ff]/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#ffcb6b]/5 rounded-full blur-3xl animate-pulse delay-700"></div>
              
              <div className="relative p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen size={20} className="text-[#0062ff]" />
                    Assignments
                  </h2>
                  <button 
                    onClick={() => navigate('/student/assignments')}
                    className="text-xs px-3 py-1.5 bg-black/50 hover:bg-[#0062ff]/10 rounded-lg transition-all flex items-center gap-2 backdrop-blur-xl shadow-sm shadow-[#0062ff]/5 hover:text-[#0062ff] border border-gray-800 hover:border-[#0062ff]/20"
                  >
                    All Assignments
                    <BookOpen size={14} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {dashboardData.assignments.map((assignment) => {
                    const deadlineStatus = getDeadlineStatus(assignment.deadline);
                    const remainingTime = getRemainingTime(assignment.deadline);
                    
                    return (
                      <div 
                        key={assignment.id} 
                        onClick={() => navigate('/student/assignments', { 
                          state: { selectedAssignment: assignment }
                        })}
                        className="group relative backdrop-blur-md rounded-lg overflow-hidden cursor-pointer"
                      >
                        {/* Glass background for each item */}
                        <div className={`absolute inset-0 ${
                          deadlineStatus === 'urgent' 
                            ? 'bg-[#ff5555]/10' 
                            : 'bg-[#151515] group-hover:bg-[#1d1d1d]'
                        } transition-colors rounded-lg`}></div>
                        <div className={`absolute inset-0 border ${
                          deadlineStatus === 'urgent'
                            ? 'border-[#ff5555]/20'
                            : 'border-gray-800 group-hover:border-[#0062ff]/20'
                        } rounded-lg`}></div>
                        
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0062ff]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        
                        <div className="relative p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-white">{assignment.title}</h3>
                              <p className="text-xs text-gray-500 mt-1">{assignment.subject}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              deadlineStatus === 'urgent' 
                                ? 'bg-[#ff5555]/20 text-[#ff5555]' 
                                : deadlineStatus === 'important'
                                ? 'bg-[#ffcb6b]/20 text-[#ffcb6b]'
                                : 'bg-[#00ffd0]/20 text-[#00ffd0]'
                            }`}>
                              {remainingTime}
                            </span>
                          </div>
                          
                          {assignment.progress !== undefined && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Progress</span>
                                <span className="text-gray-300">{assignment.progress}%</span>
                              </div>
                              <div className="w-full bg-[#222222] rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full transition-all ${
                                    deadlineStatus === 'urgent' 
                                      ? 'bg-[#ff5555]' 
                                      : deadlineStatus === 'important'
                                      ? 'bg-[#ffcb6b]'
                                      : 'bg-[#0062ff]'
                                  }`}
                                  style={{ width: `${assignment.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Add Planner Section */}
            <motion.div
              className="relative backdrop-blur-2xl rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {/* Glass background with multiple layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c]/90 to-black/90 rounded-xl"></div>
              <div className="absolute inset-0 backdrop-blur-xl bg-black/20"></div>
              <div className="absolute inset-0 border border-gray-800 rounded-xl"></div>
              
              {/* Gradient orbs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#8b5cf6]/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#00ffd0]/5 rounded-full blur-3xl animate-pulse delay-700"></div>
              
              <div className="relative p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Calendar size={20} className="text-[#8b5cf6]" />
                    My Planner
                  </h2>
                  <button 
                    onClick={() => navigate('/student/planner')}
                    className="text-xs px-3 py-1.5 bg-black/50 hover:bg-[#8b5cf6]/10 rounded-lg transition-all flex items-center gap-2 backdrop-blur-xl shadow-sm shadow-[#8b5cf6]/5 hover:text-[#8b5cf6] border border-gray-800 hover:border-[#8b5cf6]/20"
                  >
                    Full Planner
                    <Calendar size={14} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {dashboardData.plannerItems && dashboardData.plannerItems.length > 0 ? (
                    dashboardData.plannerItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate('/student/planner')}
                        className="group relative backdrop-blur-md rounded-lg overflow-hidden cursor-pointer"
                      >
                        {/* Glass background for each item */}
                        <div className={`absolute inset-0 ${
                          item.type === 'exam' 
                            ? 'bg-[#ff5555]/10' 
                            : item.type === 'assignment'
                              ? 'bg-[#ffcb6b]/10'
                              : 'bg-[#151515] group-hover:bg-[#1d1d1d]'
                        } transition-colors rounded-lg`}></div>
                        <div className={`absolute inset-0 border ${
                          item.type === 'exam'
                            ? 'border-[#ff5555]/20'
                            : item.type === 'assignment'
                              ? 'border-[#ffcb6b]/20'
                              : 'border-gray-800'
                        } rounded-lg`}></div>
                        
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8b5cf6]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        
                        <div className="relative p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3 items-center">
                              <div className={`p-2 rounded-full ${
                                item.type === 'exam' ? 'bg-[#ff5555]/20 text-[#ff5555]' : 
                                item.type === 'assignment' ? 'bg-[#ffcb6b]/20 text-[#ffcb6b]' : 
                                item.type === 'meeting' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 
                                'bg-gray-700/50 text-gray-400'
                              }`}>
                                {item.type === 'exam' ? <Target className="h-5 w-5" /> : 
                                item.type === 'assignment' ? <BookOpen className="h-5 w-5" /> :
                                item.type === 'meeting' ? <Users className="h-5 w-5" /> :
                                <Calendar className="h-5 w-5" />}
                              </div>
                              <div>
                                <h3 className="font-medium text-white">{item.title}</h3>
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <Calendar size={10} className="mr-1" /> 
                                  {new Date(item.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                  <Clock size={10} className="ml-2 mr-1" /> 
                                  {item.time}
                                </div>
                              </div>
                            </div>
                            <Badge className={`${
                              item.type === 'exam' ? 'bg-[#ff5555]/20 text-[#ff5555]' : 
                              item.type === 'assignment' ? 'bg-[#ffcb6b]/20 text-[#ffcb6b]' : 
                              item.type === 'meeting' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 
                              'bg-gray-700/50 text-gray-400'
                            } capitalize`}>
                              {item.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No upcoming planner items</p>
                      <Button 
                        onClick={() => navigate('/student/planner')}
                        variant="link" 
                        className="mt-1 text-[#8b5cf6]"
                      >
                        Add to your planner
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;