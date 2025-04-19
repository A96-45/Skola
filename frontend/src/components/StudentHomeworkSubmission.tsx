
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { FileUp, Clock, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { submitHomework } from '@/api/apiService';

interface HomeworkSubmissionProps {
  universityId: string;
  homeworkId: string;
  title: string;
  description: string;
  dueDate: string;
  onSubmissionComplete?: () => void;
}

const StudentHomeworkSubmission: React.FC<HomeworkSubmissionProps> = ({ 
  universityId,
  homeworkId,
  title,
  description,
  dueDate,
  onSubmissionComplete
}) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);
  
  useEffect(() => {
    // Check if homework is overdue
    const dueDateTime = new Date(dueDate).getTime();
    const currentTime = new Date().getTime();
    setIsOverdue(currentTime > dueDateTime);
  }, [dueDate]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit homework",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await submitHomework(universityId, homeworkId, user.uid, file);
      
      toast({
        title: "Success",
        description: "Your assignment has been submitted successfully",
      });
      
      setFile(null);
      if (onSubmissionComplete) {
        onSubmissionComplete();
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <Card className="w-full bg-gray-800/40 backdrop-blur-lg border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileUp className="text-blue-400" />
          {title}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className={isOverdue ? "text-red-400" : "text-amber-400"} size={16} />
          <span className={isOverdue ? "text-red-400" : "text-gray-300"}>
            {isOverdue ? "Overdue: " : "Due: "}
            {formatDate(dueDate)}
          </span>
        </div>
        
        {isOverdue && (
          <div className="bg-red-900/20 border border-red-800 rounded-md p-3 flex items-center gap-3">
            <AlertCircle className="text-red-400" size={18} />
            <p className="text-sm text-red-300">
              This assignment is past the due date. Late submissions may receive reduced credit.
            </p>
          </div>
        )}
        
        <div className="bg-gray-700/30 rounded-md p-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Upload Assignment</label>
          <Input 
            type="file" 
            onChange={handleFileChange}
            className="bg-gray-700/50 border-gray-600 text-gray-200"
          />
          {file && (
            <div className="mt-3 bg-gray-700/50 p-2 rounded-md flex items-center gap-2">
              <Check className="text-green-400" size={16} />
              <span className="text-sm text-gray-300">{file.name}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!file || isSubmitting}
          className={isSubmitting ? "opacity-70" : ""}
        >
          {isSubmitting ? "Submitting..." : "Submit Assignment"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudentHomeworkSubmission;
