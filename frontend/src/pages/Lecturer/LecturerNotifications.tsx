import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  CheckCircle, 
  Filter, 
  Inbox, 
  FileText, 
  MessageSquare, 
  Calendar, 
  User,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'message' | 'system' | 'calendar';
  time: string;
  timestamp: Date;
  read: boolean;
  studentName?: string;
  studentId?: string;
  courseCode?: string;
  assignmentTitle?: string;
}

const LecturerNotifications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'assignment' | 'message' | 'system' | 'calendar'>('all');

  useEffect(() => {
    // Simulate fetching notifications
    const fetchNotifications = async () => {
      setTimeout(() => {
        setNotifications([
          {
            id: '1',
            title: 'Assignment Submission',
            message: 'Alex Johnson has submitted their Python Basics assignment.',
            type: 'assignment',
            time: '5 minutes ago',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            read: false,
            studentName: 'Alex Johnson',
            studentId: 's1',
            courseCode: 'CS101',
            assignmentTitle: 'Python Basics Exercise'
          },
          {
            id: '2',
            title: 'New Message',
            message: 'You have a new message from Sarah Williams about the upcoming exam.',
            type: 'message',
            time: '1 hour ago',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            read: false,
            studentName: 'Sarah Williams',
            studentId: 's2',
            courseCode: 'CS101'
          },
          {
            id: '3',
            title: 'Department Meeting',
            message: 'Reminder: Computer Science Department meeting tomorrow at 2:00 PM.',
            type: 'calendar',
            time: '3 hours ago',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            read: true
          },
          {
            id: '4',
            title: 'Assignment Deadline',
            message: 'The Control Structures Assignment is due tomorrow. 12 students have not submitted yet.',
            type: 'assignment',
            time: '1 day ago',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            read: true,
            courseCode: 'CS101',
            assignmentTitle: 'Control Structures Assignment'
          },
          {
            id: '5',
            title: 'System Update',
            message: 'The university portal will be down for maintenance this weekend.',
            type: 'system',
            time: '2 days ago',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            read: true
          }
        ]);
        setLoading(false);
      }, 1000);
    };
    
    fetchNotifications();
  }, []);
  
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(
      notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    
    // Navigate based on notification type
    if (notification.type === 'assignment' && notification.assignmentTitle) {
      navigate('/lecturer/class/cs101/assignments');
      toast({
        title: "Navigating to assignments",
        description: `Viewing ${notification.assignmentTitle}`
      });
    } else if (notification.type === 'message' && notification.studentId) {
      navigate('/lecturer/students');
      toast({
        title: "Navigating to students",
        description: `View message from ${notification.studentName}`
      });
    } else if (notification.type === 'calendar') {
      navigate('/lecturer/dashboard');
      toast({
        title: "Calendar Event",
        description: "View your upcoming schedule"
      });
    }
  };
  
  const markAllAsRead = () => {
    setNotifications(
      notifications.map(n => ({ ...n, read: true }))
    );
    
    toast({
      title: "Success",
      description: "All notifications marked as read"
    });
  };
  
  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
    
    toast({
      title: "Notification Deleted",
      description: "The notification has been removed"
    });
  };
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assignment':
        return <FileText className="text-blue-400" size={20} />;
      case 'message':
        return <MessageSquare className="text-purple-400" size={20} />;
      case 'system':
        return <Bell className="text-red-400" size={20} />;
      case 'calendar':
        return <Calendar className="text-green-400" size={20} />;
    }
  };
  
  // Apply filters
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (['assignment', 'message', 'system', 'calendar'].includes(filter)) {
      return notification.type === filter;
    }
    return true;
  });
  
  // Sort by timestamp (newest first)
  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-20 px-4">
      <div className="max-w-4xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/lecturer/dashboard')}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  <Inbox className="mr-2 h-4 w-4" /> All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  <Bell className="mr-2 h-4 w-4" /> Unread
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('assignment')}>
                  <FileText className="mr-2 h-4 w-4" /> Assignments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('message')}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Messages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('calendar')}>
                  <Calendar className="mr-2 h-4 w-4" /> Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('system')}>
                  <Bell className="mr-2 h-4 w-4" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-500 bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {sortedNotifications.length > 0 ? (
            sortedNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  notification.read 
                    ? 'bg-gray-800/40' 
                    : 'bg-blue-900/20 border-l-2 border-blue-500'
                } hover:bg-gray-700/40`}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-gray-700/50 p-2 rounded-lg">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-white">{notification.title}</h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
                    </div>
                    
                    {notification.courseCode && (
                      <div className="text-sm text-blue-400 font-medium mt-0.5">
                        {notification.courseCode}
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-300 mt-1">
                      {notification.message}
                    </p>
                    
                    {notification.studentName && (
                      <div className="mt-2 flex items-center text-xs text-gray-400">
                        <User size={12} className="mr-1" />
                        {notification.studentName}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 self-end mb-1"></div>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => deleteNotification(notification.id, e)}
                      className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-gray-700/50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16 bg-gray-800/30 backdrop-blur-lg rounded-lg">
              <Bell className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300">No Notifications</h3>
              <p className="text-gray-500 mt-2">
                {filter === 'all' 
                  ? "You're all caught up!" 
                  : `No ${filter} notifications found`}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800/50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around py-3">
            {[
              { icon: Calendar, label: 'Home', path: '/lecturer/dashboard' },
              { icon: FileText, label: 'Classes', path: '/lecturer/classes' },
              { icon: User, label: 'Students', path: '/lecturer/students' }
            ].map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 group"
              >
                <item.icon className="text-gray-400 transition-all duration-300 transform group-hover:scale-110 group-hover:text-white" size={24} />
                <span className="text-xs text-gray-400 group-hover:text-white transition-colors duration-300">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerNotifications;
