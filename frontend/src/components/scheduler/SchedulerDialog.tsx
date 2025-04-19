import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Schedule } from '@/types/scheduler';
import SchedulerForm from './SchedulerForm';

interface SchedulerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleAdd: (schedule: Schedule) => void;
  initialData?: Schedule;
}

const SchedulerDialog: React.FC<SchedulerDialogProps> = ({
  open,
  onOpenChange,
  onScheduleAdd,
  initialData
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-2xl max-h-[85vh] overflow-y-auto
        bg-gray-900/95 backdrop-blur-xl border border-gray-800
        text-white shadow-2xl"
      >
        <DialogHeader className="border-b border-gray-800 pb-4">
          <DialogTitle className="text-xl sm:text-2xl text-white">
            {initialData ? 'Edit Schedule' : 'Add New Schedule'}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-300">
            {initialData 
              ? 'Update the schedule details below.'
              : 'Fill in the details for your new schedule.'}
          </DialogDescription>
        </DialogHeader>
        
        <SchedulerForm
          onScheduleAdd={onScheduleAdd}
          initialData={initialData}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SchedulerDialog; 