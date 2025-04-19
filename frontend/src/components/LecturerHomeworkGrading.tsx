
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  FileText, 
  User, 
  Download, 
  Calendar, 
  Star 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getHomeworkSubmissions, gradeHomeworkSubmission } from '@/api/apiService';

interface Submission {
  submission_id: string;
  student_id: string;
  student_name: string;
  submission_date: string;
  submission_file_path: string;
  grade: number | null;
  feedback: string | null;
}

interface HomeworkGradingProps {
  universityId: string;
  homeworkId: string;
  title: string;
}

const LecturerHomeworkGrading: React.FC<HomeworkGradingProps> = ({ 
  universityId,
  homeworkId,
  title
}) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchSubmissions();
  }, [universityId, homeworkId]);
  
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await getHomeworkSubmissions(universityId, homeworkId);
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load student submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || '');
    setFeedback(submission.feedback || '');
  };
  
  const handleGradeSubmission = async () => {
    if (!selectedSubmission) {
      return;
    }
    
    if (grade === '') {
      toast({
        title: "Missing Grade",
        description: "Please enter a grade",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await gradeHomeworkSubmission(
        universityId, 
        homeworkId, 
        selectedSubmission.submission_id, 
        { grade: Number(grade), feedback }
      );
      
      toast({
        title: "Success",
        description: "Submission graded successfully",
      });
      
      // Update local state
      setSubmissions(submissions.map(sub => 
        sub.submission_id === selectedSubmission.submission_id 
          ? { ...sub, grade: Number(grade), feedback } 
          : sub
      ));
      
      // Reset selection
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
    } catch (error) {
      console.error('Error grading submission:', error);
      toast({
        title: "Error",
        description: "Failed to grade submission",
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
  
  if (loading) {
    return (
      <Card className="w-full bg-gray-800/40 backdrop-blur-lg border-gray-700">
        <CardContent className="py-10">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full bg-gray-800/40 backdrop-blur-lg border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="text-blue-400" />
          {title} - Submissions
        </CardTitle>
        <CardDescription className="text-gray-400">
          Grade student submissions for this assignment
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h3 className="text-md font-medium mb-3 text-gray-300">Submissions ({submissions.length})</h3>
            <div className="bg-gray-700/30 rounded-md overflow-hidden max-h-[500px] overflow-y-auto">
              {submissions.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {submissions.map(submission => (
                    <div 
                      key={submission.submission_id}
                      className={`p-3 hover:bg-gray-700/50 cursor-pointer transition-colors ${
                        selectedSubmission?.submission_id === submission.submission_id ? 'bg-gray-700/70' : ''
                      }`}
                      onClick={() => handleSelectSubmission(submission)}
                    >
                      <div className="flex items-center gap-3">
                        <User className="text-gray-400" size={18} />
                        <div>
                          <p className="font-medium text-gray-200">{submission.student_name}</p>
                          <p className="text-xs text-gray-400">{formatDate(submission.submission_date)}</p>
                        </div>
                      </div>
                      
                      {submission.grade !== null && (
                        <div className="mt-2 flex items-center gap-1 text-sm">
                          <Star className="text-amber-400" size={14} />
                          <span className="text-gray-300">Grade: {submission.grade}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-400">No submissions yet</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2">
            {selectedSubmission ? (
              <div className="space-y-4">
                <div className="bg-gray-700/30 rounded-md p-4">
                  <h3 className="font-medium text-gray-200 mb-2">Submission Details</h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Student</p>
                      <p className="text-sm text-gray-200">{selectedSubmission.student_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Submitted</p>
                      <p className="text-sm text-gray-200">{formatDate(selectedSubmission.submission_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="text-blue-400" size={16} />
                      <span className="text-sm text-gray-300">Submission File</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download size={16} className="mr-1" /> Download
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Grade (0-100)</label>
                    <Input 
                      type="number" 
                      value={grade}
                      onChange={(e) => setGrade(e.target.value === '' ? '' : Number(e.target.value))}
                      min={0}
                      max={100}
                      className="bg-gray-700/50 border-gray-600 text-gray-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Feedback</label>
                    <Textarea 
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback to the student..."
                      className="bg-gray-700/50 border-gray-600 text-gray-200 min-h-24"
                    />
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={handleGradeSubmission} 
                      disabled={isSubmitting || grade === ''}
                    >
                      {isSubmitting ? "Saving..." : "Save Grade"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-10 bg-gray-700/20 rounded-md">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <h3 className="text-gray-300 font-medium">Select a Submission</h3>
                  <p className="text-gray-500 mt-1">
                    Click on a student submission to view and grade it
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LecturerHomeworkGrading;
