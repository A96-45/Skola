import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  Plus, 
  Link, 
  File, 
  Calendar,
  Clock,
  GraduationCap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

export interface NewAssignmentData {
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
}

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAssignment: (assignment: NewAssignmentData) => void;
  classCode: string;
  universityId: string;
  courseId: string;
}

interface EnhancedAssignmentData extends NewAssignmentData {
  attachments: {
    type: 'file' | 'link';
    name: string;
    url?: string;
    size?: string;
  }[];
  topic: string;
  allowLateSubmissions: boolean;
  allowResubmission: boolean;
  points: number;
  dueTime: string;
  instructions: string;
}

const CreateAssignmentDialog: React.FC<CreateAssignmentDialogProps> = ({
  open,
  onOpenChange,
  onCreateAssignment,
  classCode,
  universityId,
  courseId
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [assignment, setAssignment] = useState<EnhancedAssignmentData>({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    maxPoints: 100,
    attachments: [],
    topic: '',
    allowLateSubmissions: false,
    allowResubmission: true,
    points: 100,
    instructions: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = () => {
    // Implement file upload logic
    toast({
      title: "Coming Soon",
      description: "File upload functionality will be available soon"
    });
  };

  const handleAddLink = () => {
    // Implement link addition logic
    const url = prompt("Enter resource URL:");
    if (url) {
      setAssignment(prev => ({
        ...prev,
        attachments: [
          ...prev.attachments,
          { type: 'link', name: url, url }
        ]
      }));
    }
  };

  const handleSubmit = async () => {
    if (!assignment.title.trim()) {
      toast({
        title: "Error",
        description: "Assignment title is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      // Call your API here
      onCreateAssignment(assignment);
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: "Assignment created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create an assignment for {classCode} students.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-700">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={assignment.title}
                onChange={(e) => setAssignment({...assignment, title: e.target.value})}
                placeholder="Enter assignment title"
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Instructions</label>
              <textarea
                value={assignment.instructions}
                onChange={(e) => setAssignment({...assignment, instructions: e.target.value})}
                placeholder="Enter detailed instructions..."
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={assignment.dueDate}
                  onChange={(e) => setAssignment({...assignment, dueDate: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Time</label>
                <Input
                  type="time"
                  value={assignment.dueTime}
                  onChange={(e) => setAssignment({...assignment, dueTime: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Topic (Optional)</label>
              <Input
                value={assignment.topic}
                onChange={(e) => setAssignment({...assignment, topic: e.target.value})}
                placeholder="e.g., Week 1, Chapter 2"
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Button onClick={handleFileUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
              <Button variant="outline" onClick={handleAddLink}>
                <Link className="mr-2 h-4 w-4" />
                Add Link
              </Button>
            </div>

            <div className="space-y-2">
              {assignment.attachments.map((attachment, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between bg-gray-700/50 p-2 rounded"
                >
                  <div className="flex items-center">
                    {attachment.type === 'file' ? 
                      <File className="mr-2 h-4 w-4" /> : 
                      <Link className="mr-2 h-4 w-4" />
                    }
                    <span className="text-sm">{attachment.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setAssignment(prev => ({
                        ...prev,
                        attachments: prev.attachments.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Points</label>
              <Input
                type="number"
                value={assignment.points}
                onChange={(e) => setAssignment({...assignment, points: parseInt(e.target.value)})}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-medium">Allow Late Submissions</h4>
                <p className="text-xs text-gray-400">Students can submit after due date</p>
              </div>
              <Switch
                checked={assignment.allowLateSubmissions}
                onCheckedChange={(checked) => 
                  setAssignment({...assignment, allowLateSubmissions: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-medium">Allow Resubmission</h4>
                <p className="text-xs text-gray-400">Students can resubmit their work</p>
              </div>
              <Switch
                checked={assignment.allowResubmission}
                onCheckedChange={(checked) => 
                  setAssignment({...assignment, allowResubmission: checked})
                }
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentDialog;
