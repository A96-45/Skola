import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  Upload, 
  Download, 
  Link as LinkIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface AssignmentViewProps {
  assignment: {
    id: string;
    title: string;
    instructions: string;
    dueDate: string;
    dueTime: string;
    points: number;
    topic?: string;
    attachments: {
      type: 'file' | 'link';
      name: string;
      url?: string;
      size?: string;
    }[];
    status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
    allowLateSubmissions: boolean;
    allowResubmission: boolean;
    grade?: {
      score: number;
      feedback: string;
      submittedAt: string;
      gradedAt: string;
    };
  };
  onSubmit: (files: File[]) => Promise<void>;
}

const AssignmentView: React.FC<AssignmentViewProps> = ({
  assignment,
  onSubmit
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file to submit",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(selectedFiles);
      toast({
        title: "Success",
        description: "Assignment submitted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = new Date(`${assignment.dueDate}T${assignment.dueTime}`) < new Date();
  const canSubmit = !isOverdue || assignment.allowLateSubmissions;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Assignment Header */}
      <div className="bg-card rounded-lg p-4 md:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-bold">{assignment.title}</h1>
            {assignment.topic && (
              <Badge variant="outline" className="mt-2">
                {assignment.topic}
              </Badge>
            )}
          </div>
          <div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
            <div className="text-xl md:text-2xl font-bold">{assignment.points}</div>
            <div className="text-sm text-muted-foreground">points</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              Due: {new Date(`${assignment.dueDate}T${assignment.dueTime}`).toLocaleString()}
            </span>
          </div>
          {isOverdue && !assignment.allowLateSubmissions && (
            <Badge variant="destructive" className="self-start">Overdue</Badge>
          )}
        </div>

        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          {assignment.instructions}
        </div>
      </div>

      {/* Resources */}
      {assignment.attachments.length > 0 && (
        <div className="bg-card rounded-lg p-4 md:p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Resources</h2>
          <div className="space-y-2">
            {assignment.attachments.map((attachment, index) => (
              <div 
                key={index}
                className="flex items-center justify-between bg-muted/50 p-3 rounded-lg"
              >
                <div className="flex items-center min-w-0">
                  {attachment.type === 'file' ? 
                    <FileText className="text-primary mr-3 flex-shrink-0" size={20} /> : 
                    <LinkIcon className="text-primary mr-3 flex-shrink-0" size={20} />
                  }
                  <div className="min-w-0">
                    <div className="font-medium truncate">{attachment.name}</div>
                    {attachment.size && (
                      <div className="text-sm text-muted-foreground">{attachment.size}</div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Download size={18} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Section */}
      <div className="bg-card rounded-lg p-4 md:p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Your Work</h2>
        
        {assignment.status === 'graded' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg">Grade</div>
              <div className="text-xl md:text-2xl font-bold">
                {assignment.grade?.score} / {assignment.points}
              </div>
            </div>
            {assignment.grade?.feedback && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm font-medium mb-2">Feedback</div>
                <div className="text-muted-foreground">{assignment.grade.feedback}</div>
              </div>
            )}
            {assignment.allowResubmission && (
              <Button className="w-full sm:w-auto" onClick={() => setSelectedFiles([])}>
                Resubmit
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted rounded-lg p-4 md:p-6 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label 
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-4" />
                <div className="text-base md:text-lg font-medium">
                  Drop files here or click to upload
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Supported files: PDF, DOC, DOCX, ZIP
                </p>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-muted/50 p-2 rounded"
                  >
                    <div className="flex items-center min-w-0">
                      <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex-shrink-0"
                      onClick={() => {
                        setSelectedFiles(files => 
                          files.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                className="flex-1"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting || selectedFiles.length === 0}
              >
                {submitting ? 'Submitting...' : 'Turn In'}
              </Button>
              
              {selectedFiles.length > 0 && (
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedFiles([])}
                >
                  Clear All
                </Button>
              )}
            </div>

            {!canSubmit && (
              <div className="flex items-center justify-center text-destructive text-sm text-center">
                <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                <span>Assignment is overdue and late submissions are not allowed</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentView; 