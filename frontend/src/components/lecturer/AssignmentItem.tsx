
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle,
  Edit, 
  Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  status: 'draft' | 'published';
  submissionsCount: number;
  totalStudents: number;
  maxPoints: number;
}

interface AssignmentItemProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
}

const AssignmentItem: React.FC<AssignmentItemProps> = ({ 
  assignment, 
  onDelete, 
  onPublish 
}) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6"
    >
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <FileText className={assignment.status === 'published' ? 'text-blue-400' : 'text-gray-400'} size={22} />
            <h2 className="text-xl font-semibold">{assignment.title}</h2>
            <span className={`text-xs px-2 py-1 rounded-full ${
              assignment.status === 'published' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {assignment.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
          
          <p className="text-gray-300 mb-4">{assignment.description}</p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center text-sm">
              <Calendar className="text-blue-400 mr-2" size={16} />
              <span>Created: {formatDate(assignment.createdAt)}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="text-amber-400 mr-2" size={16} />
              <span>Due: {formatDate(assignment.dueDate)}</span>
            </div>
            {assignment.status === 'published' && (
              <div className="flex items-center text-sm">
                <CheckCircle className="text-green-400 mr-2" size={16} />
                <span>
                  {assignment.submissionsCount} / {assignment.totalStudents} Submissions
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 items-start">
          {assignment.status === 'draft' && (
            <Button 
              onClick={() => onPublish(assignment.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}
          <Button variant="secondary">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="destructive"
            onClick={() => onDelete(assignment.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {assignment.status === 'published' && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Student Submissions</h3>
            <Button variant="outline" onClick={() => navigate(`/lecturer/assignment/${assignment.id}/submissions`)}>
              View All Submissions
            </Button>
          </div>
          
          <div className="bg-gray-700/30 h-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${(assignment.submissionsCount / assignment.totalStudents) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>{Math.round((assignment.submissionsCount / assignment.totalStudents) * 100)}% complete</span>
            <span>{assignment.submissionsCount} of {assignment.totalStudents} submissions</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AssignmentItem;
