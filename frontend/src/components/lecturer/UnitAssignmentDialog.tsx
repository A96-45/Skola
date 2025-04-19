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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NewAssignmentData {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  maxPoints: number;
  allowLateSubmissions: boolean;
  allowResubmission: boolean;
}

interface UnitAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAssignment: (data: NewAssignmentData) => Promise<void>;
  unitCode: string;
}

const UnitAssignmentDialog: React.FC<UnitAssignmentDialogProps> = ({
  open,
  onOpenChange,
  onCreateAssignment,
  unitCode
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewAssignmentData>({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    maxPoints: 100,
    allowLateSubmissions: false,
    allowResubmission: true
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.dueDate || !formData.dueTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreateAssignment(formData);
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
            Create an assignment for {unitCode}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter assignment title"
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter assignment description and instructions..."
              className="bg-gray-700 border-gray-600 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Time</label>
              <div className="relative">
                <Input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                />
                <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Maximum Points</label>
            <Input
              type="number"
              value={formData.maxPoints}
              onChange={(e) => setFormData({...formData, maxPoints: parseInt(e.target.value)})}
              min={0}
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Allow Late Submissions</label>
                <p className="text-sm text-gray-400">Students can submit after the due date</p>
              </div>
              <Switch
                checked={formData.allowLateSubmissions}
                onCheckedChange={(checked) => setFormData({...formData, allowLateSubmissions: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Allow Resubmission</label>
                <p className="text-sm text-gray-400">Students can resubmit their work</p>
              </div>
              <Switch
                checked={formData.allowResubmission}
                onCheckedChange={(checked) => setFormData({...formData, allowResubmission: checked})}
              />
            </div>
          </div>
        </div>

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

export default UnitAssignmentDialog; 