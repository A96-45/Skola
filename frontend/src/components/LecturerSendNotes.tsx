import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/context/WebSocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { FileText, Send, Users, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
}

interface Course {
  id: string;
  title: string;
  code: string;
  students: number;
}

// Mock data for testing
const mockCourses: Course[] = [
  { id: '1', title: 'Introduction to Programming', code: 'CS101', students: 30 },
  { id: '2', title: 'Web Development', code: 'CS102', students: 25 },
];

const mockStudents: Student[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', course: '1' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', course: '1' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', course: '2' },
];

const LecturerSendNotes: React.FC = () => {
  const { user } = useAuth();
  const { shareDocument } = useWebSocket();
  
  const [title, setTitle] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(true);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Simulate loading courses
    const loadCourses = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        setCourses(mockCourses);
      } catch (err) {
        console.error("Error loading courses:", err);
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadCourses();
  }, []);
  
  const filteredStudents = selectedCourse 
    ? mockStudents.filter(student => student.course === selectedCourse) 
    : [];
  
  const handleCourseChange = async (courseId: string) => {
    setSelectedCourse(courseId);
    setSendToAll(true);
    setSelectedStudents([]);
    
    setLoading(true);
    try {
      // In a real app, this would be an API call
      setStudents(mockStudents.filter(student => student.course === courseId));
    } catch (err) {
      console.error("Error loading students:", err);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };
  
  const handleSendNotes = async () => {
    if (!title || !documentUrl) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and document URL",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedCourse) {
      toast({
        title: "No Course Selected",
        description: "Please select a course",
        variant: "destructive"
      });
      return;
    }
    
    const recipients = sendToAll 
      ? filteredStudents.map(student => student.id) 
      : selectedStudents;
    
    if (recipients.length === 0) {
      toast({
        title: "No Recipients",
        description: "There are no students to send to",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Send document using WebSocket context
      await shareDocument(title, documentUrl, recipients);
      
      toast({
        title: "Notes Sent",
        description: `Sent to ${recipients.length} student${recipients.length !== 1 ? 's' : ''}`,
      });
      
      // Reset form
      setTitle('');
      setDocumentUrl('');
      setDescription('');
      
    } catch (err: any) {
      console.error("Error sending notes:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to send notes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Send Notes to Students</CardTitle>
        <CardDescription>
          Share documents with students in your courses
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Course</label>
          <Select 
            value={selectedCourse} 
            onValueChange={handleCourseChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title} ({course.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            placeholder="Document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Document URL</label>
          <Input
            placeholder="https://..."
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description (Optional)</label>
          <Textarea
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {selectedCourse && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Recipients</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSendToAll(!sendToAll)}
              >
                {sendToAll ? 'Select Specific Students' : 'Send to All'}
              </Button>
            </div>

            {!sendToAll && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredStudents.map(student => (
                  <Button
                    key={student.id}
                    variant={selectedStudents.includes(student.id) ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => toggleStudent(student.id)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {student.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleSendNotes}
          disabled={loading}
        >
          {loading ? (
            "Sending..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Notes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LecturerSendNotes;
