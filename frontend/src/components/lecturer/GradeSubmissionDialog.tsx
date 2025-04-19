import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Submission {
  id: string;
  studentName: string;
  submittedAt: string;
  files: {
    name: string;
    url: string;
    size: string;
  }[];
}

interface GradeSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission;
  maxPoints: number;
  onGradeSubmit: (grade: number, feedback: string) => Promise<void>;
}

const GradeSubmissionDialog: React.FC<GradeSubmissionDialogProps> = ({
  open,
  onOpenChange,
  submission,
  maxPoints,
  onGradeSubmit
}) => {
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (grade < 0 || grade > maxPoints) {
      toast({
        title: "Invalid Grade",
        description: `Grade must be between 0 and ${maxPoints}`,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onGradeSubmit(grade, feedback);
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Grade submitted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit grade",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>Grade Submission - {submission.studentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Submitted Files</h4>
            <div className="space-y-2">
              {submission.files.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
                >
                  <div className="flex items-center">
                    <FileText className="text-blue-400 mr-3" size={20} />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-400">{file.size}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download size={18} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Grade (out of {maxPoints})</label>
            <Input
              type="number"
              min={0}
              max={maxPoints}
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Feedback</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback to the student..."
              className="bg-gray-800 border-gray-700 min-h-[100px]"
            />
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
            {isSubmitting ? 'Submitting...' : 'Submit Grade'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GradeSubmissionDialog; 