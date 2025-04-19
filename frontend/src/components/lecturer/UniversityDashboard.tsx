import React, { useState, useEffect } from 'react';
import { School, User, Users, Bell, BookOpen, Send, GraduationCap, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { University } from '@/data/universities';
import { useWebSocket, NotificationType } from '@/context/WebSocketContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import UniversityCard from '../UniversityCard';

interface Student {
  id: string;
  name: string;
  course: string;
  university: string;
  universityId: string;
  yearJoined: number;
  currentYear: number;
  profileImage?: string;
}

interface SendNotificationProps {
  universityId: string;
  universityName: string;
  courseFilter: string | null;
  students: Student[];
  onClose: () => void;
}

const SendNotificationDialog: React.FC<SendNotificationProps> = ({ 
  universityId, 
  universityName,
  courseFilter,
  students,
  onClose 
}) => {
  const { sendNotification } = useWebSocket();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState<NotificationType>('announcement');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please provide both title and message');
      return;
    }

    setSending(true);
    
    sendNotification({
      type: notificationType,
      title,
      message,
      universityId,
      courseId: courseFilter || undefined,
      recipients: students.map(s => s.id)
    });
    
    // Reset and close dialog
    setTimeout(() => {
      setSending(false);
      setTitle('');
      setMessage('');
      onClose();
    }, 1000);
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h4 className="text-sm font-medium">Recipients:</h4>
            <Badge variant="outline">{students.length} students</Badge>
          </div>
          
          <div className="text-sm text-muted-foreground break-words">
            University: {universityName}
            {courseFilter && <span className="block sm:inline"> • Course: {courseFilter}</span>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={notificationType === 'announcement' ? "default" : "outline"} 
                onClick={() => setNotificationType('announcement')}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Bell className="h-4 w-4 mr-1" />
                Announcement
              </Button>
              <Button 
                variant={notificationType === 'assignment' ? "default" : "outline"} 
                onClick={() => setNotificationType('assignment')}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Assignment
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Notification title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded-md min-h-[100px]"
              placeholder="Write your message here..."
            />
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleSend} disabled={sending} className="w-full sm:w-auto">
            {sending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UniversityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeUniversityId, setActiveUniversityId] = useState<string | null>(null);
  const [universitiesData, setUniversitiesData] = useState<University[]>([]);
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  
  const mockStudents: Student[] = [
    {
      id: "student1",
      name: "John Doe",
      course: "Computer Science",
      university: "University of Nairobi",
      universityId: "UON",
      yearJoined: 2021,
      currentYear: 2023
    },
    {
      id: "student2",
      name: "Jane Smith",
      course: "Software Engineering",
      university: "University of Nairobi",
      universityId: "UON",
      yearJoined: 2022,
      currentYear: 2023
    },
    {
      id: "student3",
      name: "David Kimani",
      course: "Information Technology",
      university: "Strathmore University",
      universityId: "SU",
      yearJoined: 2020,
      currentYear: 2023
    },
    {
      id: "student4",
      name: "Mary Wanjiku",
      course: "Computer Science",
      university: "Strathmore University",
      universityId: "SU",
      yearJoined: 2022,
      currentYear: 2023
    }
  ];
  
  useEffect(() => {
    if (user?.universities?.length) {
      const linkedUniversities = user.universities.map(uni => {
        // Check if uni is a string or an object
        if (typeof uni === 'string') {
          // Handle case where uni is just an ID string
          return { 
            id: uni, 
            name: "Unknown University", 
            department: "Department",
            image: "/placeholder.svg"
          } as University;
        } else {
          // Handle case where uni is already a University object
          return uni as University;
        }
      });
      
      setUniversitiesData(linkedUniversities);
      
      if (!activeUniversityId && linkedUniversities.length > 0) {
        setActiveUniversityId(linkedUniversities[0].id);
      }
    }
  }, [user, activeUniversityId]);
  
  useEffect(() => {
    if (!activeUniversityId) return;
    
    let filteredStudents = mockStudents.filter(student => 
      student.universityId === activeUniversityId
    );
    
    if (courseFilter) {
      filteredStudents = filteredStudents.filter(student => 
        student.course === courseFilter
      );
    }
    
    setStudents(filteredStudents);
  }, [activeUniversityId, courseFilter]);
  
  const uniqueCourses = [...new Set(
    mockStudents
      .filter(student => student.universityId === activeUniversityId)
      .map(student => student.course)
  )];

  const activeUniversity = universitiesData.find(u => u.id === activeUniversityId);
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {universitiesData.map((university) => (
          <UniversityCard
            key={university.id}
            university={university}
            isActive={university.id === activeUniversityId}
            onClick={() => setActiveUniversityId(university.id)}
            className="h-full"
          />
        ))}
      </div>

      {activeUniversityId && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold">
              {universitiesData.find(u => u.id === activeUniversityId)?.name}
            </h2>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <select
                value={courseFilter || ''}
                onChange={(e) => setCourseFilter(e.target.value || null)}
                className="flex-1 sm:flex-none px-3 py-2 border rounded-md"
              >
                <option value="">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              
              <Button
                onClick={() => setShowNotificationDialog(true)}
                className="flex-1 sm:flex-none"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
              </CardContent>
            </Card>

            {/* Add more metric cards here */}
          </div>

          <div className="bg-card rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Students</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Card key={student.id} className="flex items-start p-4 gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{student.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{student.course}</p>
                    <p className="text-sm text-muted-foreground">
                      Year {student.currentYear - student.yearJoined + 1}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {showNotificationDialog && (
        <SendNotificationDialog
          universityId={activeUniversityId!}
          universityName={universitiesData.find(u => u.id === activeUniversityId)?.name || ''}
          courseFilter={courseFilter}
          students={students}
          onClose={() => setShowNotificationDialog(false)}
        />
      )}
    </div>
  );
};

export default UniversityDashboard;
