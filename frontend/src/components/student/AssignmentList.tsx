import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  dueTime: string;
  points: number;
  topic?: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  grade?: {
    score: number;
  };
}

interface AssignmentListProps {
  assignments: Assignment[];
}

const AssignmentList: React.FC<AssignmentListProps> = ({ assignments }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'not_started': return 'text-gray-400';
      case 'in_progress': return 'text-blue-400';
      case 'submitted': return 'text-green-400';
      case 'graded': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case 'not_started': return AlertCircle;
      case 'in_progress': return Clock;
      case 'submitted': return CheckCircle;
      case 'graded': return FileText;
      default: return AlertCircle;
    }
  };

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const StatusIcon = getStatusIcon(assignment.status);
        const isOverdue = new Date(`${assignment.dueDate}T${assignment.dueTime}`) < new Date();
        
        return (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-4 cursor-pointer hover:bg-gray-800/60 transition-colors"
            onClick={() => navigate(`/student/assignments/${assignment.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <StatusIcon 
                    className={getStatusColor(assignment.status)} 
                    size={18} 
                  />
                  <h3 className="font-medium">{assignment.title}</h3>
                  {assignment.topic && (
                    <Badge variant="outline" className="ml-2">
                      {assignment.topic}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Due: {new Date(`${assignment.dueDate}T${assignment.dueTime}`).toLocaleString()}
                  </div>
                  <div>{assignment.points} points</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {assignment.status === 'graded' && (
                  <div className="text-right mr-4">
                    <div className="text-lg font-bold">
                      {assignment.grade?.score}/{assignment.points}
                    </div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                )}
                <ChevronRight className="text-gray-400" size={20} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AssignmentList; 