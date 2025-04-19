import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Schedule } from '@/types/scheduler';
import { v4 as uuidv4 } from 'uuid';

interface SchedulerFormProps {
  onScheduleAdd: (schedule: Schedule) => void;
  initialData?: Schedule;
  onCancel: () => void;
}

type ScheduleType = "meeting" | "class" | "assignment" | "exam" | "other" | "imported";
type PriorityType = "high" | "medium" | "low";
type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

const SchedulerForm: React.FC<SchedulerFormProps> = ({
  onScheduleAdd,
  initialData,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState('create');
  const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState(initialData?.type || 'meeting');
  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  const [recurrence, setRecurrence] = useState(initialData?.recurrence || 'none');
  const [startTime, setStartTime] = useState(initialData?.startTime || '');
  const [endTime, setEndTime] = useState(initialData?.endTime || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [reminder, setReminder] = useState(initialData?.reminder || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const schedule: Schedule = {
      id: initialData?.id || uuidv4(),
      title,
      type,
      priority,
      date,
      startTime,
      endTime,
      description,
      recurrence,
      reminder
    };
    onScheduleAdd(schedule);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a schedule entry for the uploaded file
      const schedule: Schedule = {
        id: uuidv4(),
        title: file.name.replace('.pdf', ''),
        type: 'imported',
        priority: 'medium',
        date: new Date(),
        startTime: '',
        endTime: '',
        description: 'Imported from PDF',
        recurrence: 'none',
        reminder: false
      };
      onScheduleAdd(schedule);
    }
  };

  const reset = () => {
    setTitle('');
    setType('meeting');
    setPriority('medium');
    setDate(new Date());
    setStartTime('');
    setEndTime('');
    setDescription('');
    setRecurrence('none');
    setReminder(false);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
        <TabsTrigger value="create" className="data-[state=active]:bg-gray-700 text-white">Create New</TabsTrigger>
        <TabsTrigger value="google" className="data-[state=active]:bg-gray-700 text-white">Google Calendar</TabsTrigger>
        <TabsTrigger value="pdf" className="data-[state=active]:bg-gray-700 text-white">Import PDF</TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="space-y-4 mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter schedule title"
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400
                  focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue placeholder="Select type" className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="meeting" className="text-white">Meeting</SelectItem>
                  <SelectItem value="class" className="text-white">Class</SelectItem>
                  <SelectItem value="assignment" className="text-white">Assignment</SelectItem>
                  <SelectItem value="exam" className="text-white">Exam</SelectItem>
                  <SelectItem value="other" className="text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-white">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue placeholder="Select priority" className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="high" className="text-white">High</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium</SelectItem>
                  <SelectItem value="low" className="text-white">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurrence" className="text-white">Recurrence</Label>
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue placeholder="Select recurrence" className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="none" className="text-white">None</SelectItem>
                  <SelectItem value="daily" className="text-white">Daily</SelectItem>
                  <SelectItem value="weekly" className="text-white">Weekly</SelectItem>
                  <SelectItem value="monthly" className="text-white">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-white">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-white">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter schedule description"
              className="min-h-[100px] bg-gray-800/50 border-gray-700 text-white 
                placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              className="rounded-md border border-gray-700 bg-gray-800/50 text-white"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={reset}
              className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
            >
              Reset
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              {initialData ? 'Update' : 'Create'} Schedule
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="google" className="text-center py-8">
        <p className="text-white">
          Google Calendar import feature coming soon...
        </p>
      </TabsContent>

      <TabsContent value="pdf" className="text-center py-8">
        <Label htmlFor="pdfUpload" className="cursor-pointer">
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 hover:border-gray-600 transition-colors">
            <p className="text-white">
              Drop your PDF file here or click to browse
            </p>
            <Input
              id="pdfUpload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </Label>
      </TabsContent>
    </Tabs>
  );
};

export default SchedulerForm; 