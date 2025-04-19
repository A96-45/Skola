
import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AssignmentsHeaderProps {
  classCode: string;
  classTitle: string;
  id: string;
  onNewClick: () => void;
}

const AssignmentsHeader: React.FC<AssignmentsHeaderProps> = ({
  classCode,
  classTitle,
  id,
  onNewClick
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/lecturer/classes/${id}`)}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{classCode} Assignments</h1>
          <p className="text-gray-400">{classTitle}</p>
        </div>
      </div>
      
      <Button 
        className="bg-blue-600 hover:bg-blue-700"
        onClick={onNewClick}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Assignment
      </Button>
    </div>
  );
};

export default AssignmentsHeader;
