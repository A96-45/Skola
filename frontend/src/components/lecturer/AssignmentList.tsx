
import React from 'react';
import AssignmentItem, { Assignment } from './AssignmentItem';
import EmptyAssignmentState from './EmptyAssignmentState';

interface AssignmentListProps {
  assignments: Assignment[];
  onDeleteAssignment: (id: string) => void;
  onPublishAssignment: (id: string) => void;
  onCreateClick: () => void;
}

const AssignmentList: React.FC<AssignmentListProps> = ({ 
  assignments,
  onDeleteAssignment,
  onPublishAssignment,
  onCreateClick
}) => {
  if (assignments.length === 0) {
    return <EmptyAssignmentState onCreateClick={onCreateClick} />;
  }
  
  return (
    <div className="space-y-6">
      {assignments.map((assignment) => (
        <AssignmentItem 
          key={assignment.id}
          assignment={assignment}
          onDelete={onDeleteAssignment}
          onPublish={onPublishAssignment}
        />
      ))}
    </div>
  );
};

export default AssignmentList;
