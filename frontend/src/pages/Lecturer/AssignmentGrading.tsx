import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import AssignmentSubmissions from '@/components/lecturer/AssignmentSubmissions';
import { toast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  title: string;
  maxPoints: number;
  submissions: {
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
  }[];
}

const AssignmentGrading: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    // Simulate fetching assignment data
    const fetchAssignment = async () => {
      setTimeout(() => {
        setAssignment({
          id: id || '',
          title: 'Assignment 1: Introduction to React',
          maxPoints: 100,
          submissions: [
            {
              id: '1',
              studentName: 'John Doe',
              studentId: 'STD001',
              submittedAt: '2024-01-15T10:30:00',
              status: 'submitted',
              files: [
                {
                  name: 'assignment1.pdf',
                  url: '#',
                  size: '2.4 MB'
                }
              ]
            },
            {
              id: '2',
              studentName: 'Jane Smith',
              studentId: 'STD002',
              submittedAt: '2024-01-14T15:45:00',
              status: 'graded',
              files: [
                {
                  name: 'submission.zip',
                  url: '#',
                  size: '4.1 MB'
                }
              ],
              grade: {
                score: 95,
                feedback: 'Excellent work! Very well structured code.',
                gradedAt: '2024-01-15T09:00:00'
              }
            }
          ]
        });
        setLoading(false);
      }, 1000);
    };

    fetchAssignment();
  }, [id]);

  const handleGradeSubmission = async (
    submissionId: string, 
    grade: number, 
    feedback: string
  ) => {
    // Implement grading logic here
    toast({
      title: "Success",
      description: "Grade submitted successfully"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-20">
      <Header />
      <div className="max-w-7xl mx-auto p-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </Button>

        {assignment && (
          <AssignmentSubmissions
            assignmentId={assignment.id}
            assignmentTitle={assignment.title}
            maxPoints={assignment.maxPoints}
            submissions={assignment.submissions}
            onGradeSubmission={handleGradeSubmission}
          />
        )}
      </div>
    </div>
  );
};

export default AssignmentGrading; 