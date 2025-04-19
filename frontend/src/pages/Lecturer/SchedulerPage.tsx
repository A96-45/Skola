import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Schedule } from '@/types/scheduler';
import { motion } from 'framer-motion';
import SchedulerDialog from '@/components/scheduler/SchedulerDialog';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { Clock } from 'lucide-react';

const SchedulerPage: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    // Load schedules from localStorage
    const savedSchedules = localStorage.getItem('schedules');
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    }
  }, []);

  const handleAddSchedule = (newSchedule: Schedule) => {
    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
  };

  const getScheduleStatus = (schedule: Schedule): 'upcoming' | 'past' | 'urgent' => {
    const now = new Date();
    const scheduleDate = new Date(schedule.date);
    
    if (scheduleDate < now) return 'past';
    if (schedule.priority === 'high') return 'urgent';
    return 'upcoming';
  };

  const getStatusColor = (status: 'upcoming' | 'past' | 'urgent') => {
    switch (status) {
      case 'urgent': return 'bg-red-500';
      case 'past': return 'bg-gray-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusText = (status: 'upcoming' | 'past' | 'urgent') => {
    switch (status) {
      case 'urgent': return 'text-red-500 border-red-500';
      case 'past': return 'text-gray-500 border-gray-500';
      default: return 'text-green-500 border-green-500';
    }
  };

  const formatTime = (date: Date, time?: string) => {
    if (!time) return new Date(date).toLocaleDateString();
    return `${new Date(date).toLocaleDateString()} ${time}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white pb-20">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Timeline</h1>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="space-y-2">
            {schedules.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No schedules yet. Click the "Add Schedule" button to create one.
              </p>
            ) : (
              schedules
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((schedule) => {
                  const status = getScheduleStatus(schedule);
                  return (
                    <motion.div
                      key={schedule.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} ${status === 'urgent' ? 'animate-pulse' : ''}`} />
                      <div className="flex-1">
                        <p className="font-medium dark:text-white">{schedule.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{schedule.description}</p>
                      </div>
                      <div className={`px-3 py-1 border rounded-md text-sm ${getStatusText(status)}`}>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatTime(schedule.date, schedule.startTime)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      <SchedulerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onScheduleAdd={handleAddSchedule}
      />
    </div>
  );
};

export default SchedulerPage; 