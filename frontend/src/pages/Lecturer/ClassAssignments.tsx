import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import AssignmentList from '@/components/lecturer/AssignmentList';
import CreateAssignmentDialog, { NewAssignmentData } from '@/components/lecturer/CreateAssignmentDialog';
import { Assignment } from '@/components/lecturer/AssignmentItem';
import LoadingSpinner from '@/components/lecturer/LoadingSpinner';
import AssignmentsHeader from '@/components/lecturer/AssignmentsHeader';

const ClassAssignments: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classTitle, setClassTitle] = useState('');
  const [classCode, setClassCode] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [universityId, setUniversityId] = useState('');
  const [courseId, setCourseId] = useState('');
  
  useEffect(() => {
    // Simulate fetching class and assignments data
    const fetchData = async () => {
      setTimeout(() => {
        // Mock class data
        if (id === 'cs101') {
          setClassTitle('Introduction to Programming');
          setClassCode('CS101');
          setUniversityId('univ123');
          setCourseId('course123');
        } else if (id === 'cs302') {
          setClassTitle('Advanced Data Structures');
          setClassCode('CS302');
          setUniversityId('univ123');
          setCourseId('course124');
        } else if (id === 'cs303') {
          setClassTitle('Machine Learning Basics');
          setClassCode('CS303');
        } else {
          setClassTitle('Class Title');
          setClassCode(`CLASS${id}`);
        }
        
        // Mock assignments
        setAssignments([
          {
            id: 'a1',
            title: 'Introduction to Variables and Data Types',
            description: 'Complete the exercises on basic variable declarations and data type operations.',
            dueDate: '2023-04-15',
            createdAt: '2023-03-20',
            status: 'published',
            submissionsCount: 35,
            totalStudents: 45,
            maxPoints: 100
          },
          {
            id: 'a2',
            title: 'Control Flow Structures',
            description: 'Implement various control flow mechanisms including loops and conditionals.',
            dueDate: '2023-04-22',
            createdAt: '2023-03-25',
            status: 'published',
            submissionsCount: 32,
            totalStudents: 45,
            maxPoints: 100
          },
          {
            id: 'a3',
            title: 'Functions and Modular Programming',
            description: 'Create a modular program using functions with proper parameters and return values.',
            dueDate: '2023-04-29',
            createdAt: '2023-03-30',
            status: 'draft',
            submissionsCount: 0,
            totalStudents: 45,
            maxPoints: 100
          }
        ]);
        
        setLoading(false);
      }, 1000);
    };
    
    fetchData();
  }, [id]);
  
  const handleCreateAssignment = (newAssignmentData: NewAssignmentData) => {
    // Create new assignment
    const assignment: Assignment = {
      id: `a${assignments.length + 1}`,
      title: newAssignmentData.title,
      description: newAssignmentData.description,
      dueDate: newAssignmentData.dueDate,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      submissionsCount: 0,
      totalStudents: 45,
      maxPoints: newAssignmentData.maxPoints
    };
    
    setAssignments([...assignments, assignment]);
    setShowNewDialog(false);
    
    toast({
      title: "Success",
      description: "Assignment created successfully",
    });
  };
  
  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
    toast({
      title: "Success",
      description: "Assignment deleted successfully",
    });
  };
  
  const publishAssignment = (id: string) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status: 'published' } : a
    ));
    toast({
      title: "Success",
      description: "Assignment published successfully",
    });
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-20 px-4">
      <div className="max-w-7xl mx-auto pt-6">
        <AssignmentsHeader 
          classCode={classCode} 
          classTitle={classTitle} 
          id={id || ''} 
          onNewClick={() => setShowNewDialog(true)} 
        />
        
        <AssignmentList 
          assignments={assignments}
          onDeleteAssignment={deleteAssignment}
          onPublishAssignment={publishAssignment}
          onCreateClick={() => setShowNewDialog(true)}
        />
        
        <CreateAssignmentDialog
          open={showNewDialog}
          onOpenChange={setShowNewDialog}
          onCreateAssignment={handleCreateAssignment}
          classCode={classCode}
          universityId={universityId}
          courseId={courseId}
        />
      </div>
    </div>
  );
};

export default ClassAssignments;
