import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface Schedule {
  id: string;
  unitCode: string;
  unitTitle: string;
  universityName: string;
  time: string;
  venue: string;
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
  students: number;
}

interface ScheduleManagerProps {
  schedules: Schedule[];
  onAddSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  schedules,
  onAddSchedule
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Omit<Schedule, 'id'>>({
    unitCode: '',
    unitTitle: '',
    universityName: '',
    time: '',
    venue: '',
    day: 'MON',
    students: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSchedule.unitCode || !newSchedule.unitTitle || !newSchedule.time || !newSchedule.venue) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await onAddSchedule(newSchedule);
      setShowAddForm(false);
      setNewSchedule({
        unitCode: '',
        unitTitle: '',
        universityName: '',
        time: '',
        venue: '',
        day: 'MON' as Schedule['day'],
        students: 0
      });
      toast({
        title: "Success",
        description: "Schedule added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add schedule",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Class Schedule</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Unit Code</label>
                <Input
                  value={newSchedule.unitCode}
                  onChange={(e) => setNewSchedule({ ...newSchedule, unitCode: e.target.value })}
                  placeholder="e.g., CS101"
                  className="bg-gray-700/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Unit Title</label>
                <Input
                  value={newSchedule.unitTitle}
                  onChange={(e) => setNewSchedule({ ...newSchedule, unitTitle: e.target.value })}
                  placeholder="e.g., Introduction to Programming"
                  className="bg-gray-700/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Day</label>
                <select
                  value={newSchedule.day}
                  onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value as Schedule['day'] })}
                  className="w-full bg-gray-700/50 rounded-md border border-gray-600 px-3 py-2"
                >
                  <option value="MON">Monday</option>
                  <option value="TUE">Tuesday</option>
                  <option value="WED">Wednesday</option>
                  <option value="THU">Thursday</option>
                  <option value="FRI">Friday</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Time</label>
                <Input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                  className="bg-gray-700/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Venue</label>
                <Input
                  value={newSchedule.venue}
                  onChange={(e) => setNewSchedule({ ...newSchedule, venue: e.target.value })}
                  placeholder="e.g., Room 101"
                  className="bg-gray-700/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Expected Students</label>
                <Input
                  type="number"
                  value={newSchedule.students}
                  onChange={(e) => setNewSchedule({ ...newSchedule, students: parseInt(e.target.value) })}
                  min={0}
                  className="bg-gray-700/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="ghost"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Schedule
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <motion.div
            key={schedule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg">{schedule.unitCode}: {schedule.unitTitle}</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="mr-2 h-4 w-4" />
                    {schedule.day}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="mr-2 h-4 w-4" />
                    {schedule.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <MapPin className="mr-2 h-4 w-4" />
                    {schedule.venue}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Users className="mr-2 h-4 w-4" />
                    {schedule.students} students
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleManager; 