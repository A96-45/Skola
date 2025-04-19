
import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyAssignmentStateProps {
  onCreateClick: () => void;
}

const EmptyAssignmentState: React.FC<EmptyAssignmentStateProps> = ({ onCreateClick }) => {
  return (
    <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 text-center py-20">
      <FileText className="mx-auto h-16 w-16 text-gray-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-300 mb-2">No Assignments Yet</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        Create your first assignment for students in this class
      </p>
      <Button onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        Create First Assignment
      </Button>
    </div>
  );
};

export default EmptyAssignmentState;
