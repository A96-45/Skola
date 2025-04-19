
import React from 'react';
import { FileText, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Assignment {
  title: string;
  subject: string;
  deadline: string;
  status: 'upcoming' | 'urgent' | 'important';
}

interface AssignmentsSectionProps {
  assignments: Assignment[];
}

const AssignmentsSection: React.FC<AssignmentsSectionProps> = ({ assignments }) => {
  const navigate = useNavigate();
  
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'important':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText size={20} className="text-purple-400" />
          Assignments
        </h2>
        <button 
          onClick={() => navigate('/student/assignments')}
          className="text-sm px-3 py-1.5 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors flex items-center gap-2"
        >
          View All
          <FileText size={16} />
        </button>
      </div>
      
      <div className="space-y-3">
        {assignments.map((assignment, index) => (
          <motion.div 
            key={index}
            whileHover={{ x: 4 }}
            className="bg-gray-700/30 p-3 rounded-lg cursor-pointer"
            onClick={() => navigate(`/student/assignments/${index}`)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{assignment.title}</h3>
              <span className={`text-xs px-2 py-1 rounded ${getStatusStyles(assignment.status)}`}>
                {assignment.status}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>{assignment.subject}</span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(assignment.deadline)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsSection;
