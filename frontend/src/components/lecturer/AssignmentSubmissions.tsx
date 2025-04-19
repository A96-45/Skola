import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GradeSubmissionDialog from './GradeSubmissionDialog';

interface Submission {
  id: string;
  studentName: string;
  studentId: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late';
  files: {
    name: string;
    url: string;
    size: string;
  }[];
  grade?: {
    score: number;
    feedback: string;
    gradedAt: string;
  };
}

interface AssignmentSubmissionsProps {
  assignmentId: string;
  assignmentTitle: string;
  maxPoints: number;
  submissions: Submission[];
  onGradeSubmission: (submissionId: string, grade: number, feedback: string) => Promise<void>;
}

const AssignmentSubmissions: React.FC<AssignmentSubmissionsProps> = ({
  assignmentId,
  assignmentTitle,
  maxPoints,
  submissions,
  onGradeSubmission
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);

  const handleGradeSubmit = async (grade: number, feedback: string) => {
    if (selectedSubmission) {
      await onGradeSubmission(selectedSubmission.id, grade, feedback);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">{assignmentTitle}</h2>
        <div className="text-gray-400">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4">
        {submissions.map((submission) => (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{submission.studentName}</h3>
                  <Badge variant={submission.status === 'late' ? 'destructive' : 'outline'}>
                    {submission.status === 'graded' ? 'Graded' : 
                     submission.status === 'late' ? 'Late' : 'Submitted'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </div>
                  <div>{submission.files.length} file(s)</div>
                </div>

                {submission.grade && (
                  <div className="mt-2 text-sm">
                    <div className="font-medium">
                      Grade: {submission.grade.score}/{maxPoints}
                    </div>
                    {submission.grade.feedback && (
                      <div className="text-gray-400 mt-1">
                        {submission.grade.feedback}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setGradeDialogOpen(true);
                  }}
                >
                  {submission.status === 'graded' ? 'Update Grade' : 'Grade'}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedSubmission && (
        <GradeSubmissionDialog
          open={gradeDialogOpen}
          onOpenChange={setGradeDialogOpen}
          submission={selectedSubmission}
          maxPoints={maxPoints}
          onGradeSubmit={handleGradeSubmit}
        />
      )}
    </div>
  );
};

export default AssignmentSubmissions; 