import React, { useState, useEffect } from 'react';
import { format, parseISO, addDays, getDay } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Clock, BookOpen, Check, Info, FileText, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LecturerNav from '@/components/LecturerNav';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface PlannerItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  type: 'lecture' | 'assignment' | 'exam' | 'meeting' | 'office_hours' | 'other';
  completed: boolean;
  university?: string;
  course?: string;
}

interface DailyPlan {
  date: Date;
  tasks: PlannerItem[];
}

const PLANNER_STORAGE_KEY = 'LECTURER_PLANNER_DATA';

const LecturerPlanner: React.FC = () => {
  const { user } = useAuth();
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<DailyPlan[]>([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [universities, setUniversities] = useState<{ id: number; name: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);

  // Form state
  const [newItem, setNewItem] = useState<Omit<PlannerItem, 'id' | 'completed'>>({
    title: '',
    description: '',
    date: new Date(),
    time: '',
    type: 'lecture',
    university: '',
    course: ''
  });

  // Load planner data from localStorage
  useEffect(() => {
    const savedPlanner = localStorage.getItem(PLANNER_STORAGE_KEY);
    if (savedPlanner) {
      try {
        const parsed = JSON.parse(savedPlanner);
        // Convert string dates back to Date objects
        const items = parsed.map((item: any) => ({
          ...item,
          date: parseISO(item.date)
        }));
        setPlannerItems(items);
      } catch (e) {
        console.error('Error parsing planner data', e);
        setPlannerItems([]);
      }
    }

    // Fetch universities from localStorage
    const savedUniversities = localStorage.getItem('universities');
    if (savedUniversities) {
      try {
        const parsedUniversities = JSON.parse(savedUniversities);
        setUniversities(parsedUniversities.map((uni: any) => ({
          id: uni.id,
          name: uni.name
        })));
      } catch (e) {
        console.error('Error parsing universities data', e);
      }
    }

    // For demo purposes, set some courses
    setCourses([
      { id: 'CS101', name: 'Introduction to Programming' },
      { id: 'CS202', name: 'Data Structures' },
      { id: 'CS303', name: 'Database Systems' },
      { id: 'CS404', name: 'Advanced Algorithms' }
    ]);
  }, []);

  // Generate weekly plan whenever planner items or selected date changes
  useEffect(() => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const week: DailyPlan[] = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(startOfWeek, i);
      const dayTasks = plannerItems.filter(item => 
        item.date.getDate() === day.getDate() && 
        item.date.getMonth() === day.getMonth() && 
        item.date.getFullYear() === day.getFullYear()
      );
      week.push({ date: day, tasks: dayTasks });
    }
    setWeeklyPlan(week);
  }, [plannerItems, selectedDate]);

  // Save to localStorage when planner items change
  useEffect(() => {
    if (plannerItems.length > 0) {
      // Convert Date objects to strings for storage
      const itemsToSave = plannerItems.map(item => ({
        ...item,
        date: format(item.date, 'yyyy-MM-dd')
      }));
      localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(itemsToSave));
    }
  }, [plannerItems]);

  const handleAddItem = () => {
    if (!newItem.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your planner item",
        variant: "destructive"
      });
      return;
    }

    const item: PlannerItem = {
      id: Date.now().toString(),
      ...newItem,
      completed: false
    };

    setPlannerItems(prev => [...prev, item]);
    setIsAddItemDialogOpen(false);
    setNewItem({
      title: '',
      description: '',
      date: new Date(),
      time: '',
      type: 'lecture',
      university: '',
      course: ''
    });

    toast({
      title: "Item added",
      description: "Your planner item has been added successfully",
    });
  };

  const handleToggleComplete = (id: string) => {
    setPlannerItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setPlannerItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item deleted",
      description: "Your planner item has been removed",
    });
  };

  const getItemsForSelectedDate = () => {
    return plannerItems.filter(item => 
      item.date.getDate() === selectedDate.getDate() && 
      item.date.getMonth() === selectedDate.getMonth() && 
      item.date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getTypeIcon = (type: PlannerItem['type']) => {
    switch (type) {
      case 'lecture': return <BookOpen className="h-5 w-5" />;
      case 'assignment': return <FileText className="h-5 w-5" />;
      case 'exam': return <AlertTriangle className="h-5 w-5" />;
      case 'meeting': return <Users className="h-5 w-5" />;
      case 'office_hours': return <Clock className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white">
      <Header />
      <div className="container px-4 pb-20 pt-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Daily Planner</h1>
        
        <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#0c0c0c] border border-gray-800 backdrop-blur-xl">
            <TabsTrigger 
              value="daily" 
              className="text-sm data-[state=active]:bg-[#151515] data-[state=active]:text-[#00ffd0]"
            >
              <span>Daily View</span>
            </TabsTrigger>
            <TabsTrigger 
              value="weekly" 
              className="text-sm data-[state=active]:bg-[#151515] data-[state=active]:text-[#00ffd0]"
            >
              <span>Weekly Plan</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="space-y-4 mt-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">
                Daily View
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal shadow-md border border-gray-800 bg-[#0c0c0c] hover:bg-[#151515] text-white",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#0c0c0c] border border-gray-800">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        className="bg-[#0c0c0c] text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-[#00ffd0] text-black hover:bg-[#00ffd0]/80 shadow-md shadow-[#00ffd0]/20"
                      aria-label="Add Planner Item"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Add Item</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-[#0c0c0c] border-gray-800 text-white backdrop-blur-xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add Planner Item</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Create a new item for your daily planner
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="title" className="text-sm font-medium">Title</label>
                        <Input
                          id="title"
                          value={newItem.title}
                          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                          placeholder="Lecture, Meeting, Assignment, etc."
                          className="bg-[#151515] border-gray-800 text-white"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="description" className="text-sm font-medium">Description</label>
                        <Textarea
                          id="description"
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          placeholder="Details about the planner item..."
                          className="bg-[#151515] border-gray-800 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label htmlFor="date" className="text-sm font-medium">Date</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "justify-start text-left font-normal bg-[#151515] border-gray-800 text-white",
                                  !newItem.date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newItem.date ? format(newItem.date, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-[#0c0c0c] border border-gray-800">
                              <Calendar
                                mode="single"
                                selected={newItem.date}
                                onSelect={(date) => date && setNewItem({ ...newItem, date })}
                                initialFocus
                                className="bg-[#0c0c0c] text-white"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="time" className="text-sm font-medium">Time</label>
                          <Input
                            id="time"
                            value={newItem.time}
                            onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                            placeholder="e.g., 10:00 AM"
                            className="bg-[#151515] border-gray-800 text-white"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="type" className="text-sm font-medium">Type</label>
                        <Select
                          value={newItem.type}
                          onValueChange={(value: PlannerItem['type']) => 
                            setNewItem({ ...newItem, type: value })}
                        >
                          <SelectTrigger className="bg-[#151515] border-gray-800 text-white">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0c0c0c] border-gray-800 text-white">
                            <SelectItem value="lecture" className="focus:bg-[#151515] focus:text-white">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-[#00ffd0]" />
                                <span>Lecture</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="assignment" className="focus:bg-[#151515] focus:text-white">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-[#0062ff]" />
                                <span>Assignment</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="exam" className="focus:bg-[#151515] focus:text-white">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-[#ff5555]" />
                                <span>Exam</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="meeting" className="focus:bg-[#151515] focus:text-white">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-[#8b5cf6]" />
                                <span>Meeting</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="office_hours" className="focus:bg-[#151515] focus:text-white">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#ffcb6b]" />
                                <span>Office Hours</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="other" className="focus:bg-[#151515] focus:text-white">
                              <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-gray-400" />
                                <span>Other</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={handleAddItem} 
                        className="bg-[#00ffd0] text-black hover:bg-[#00ffd0]/80 shadow-md shadow-[#00ffd0]/20"
                      >
                        Add Item
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="py-4">
                <h2 className="text-xl font-bold mb-4">
                  {format(selectedDate, "EEEE, MMMM d")}
                </h2>
                
                <Card className="bg-[#0c0c0c]/70 border-gray-800 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Items for {format(selectedDate, 'EEEE, MMMM d')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {getItemsForSelectedDate().length > 0 ? (
                      getItemsForSelectedDate()
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map(item => (
                          <div 
                            key={item.id} 
                            className={cn(
                              "p-3 rounded-lg flex items-start justify-between border border-gray-800",
                              item.completed 
                                ? "bg-[#00ffd0]/10 text-[#00ffd0]" 
                                : item.type === 'exam' 
                                  ? "bg-[#ff5555]/10 border-l-4 border-l-[#ff5555]" 
                                  : item.type === 'lecture' 
                                    ? "bg-[#0062ff]/10 border-l-4 border-l-[#0062ff]" 
                                    : item.type === 'meeting' 
                                      ? "bg-[#8b5cf6]/10 border-l-4 border-l-[#8b5cf6]" 
                                      : item.type === 'office_hours'
                                        ? "bg-[#ffcb6b]/10 border-l-4 border-l-[#ffcb6b]"
                                        : "bg-gray-800/50 border-l-4 border-l-gray-500"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleComplete(item.id);
                                }}
                                className={cn(
                                  "h-6 w-6 rounded-full mt-1",
                                  item.completed 
                                    ? "bg-[#00ffd0]/20 text-[#00ffd0]"
                                    : "bg-[#151515] text-gray-300 hover:bg-[#1d1d1d]"
                                )}
                              >
                                {item.completed ? <Check className="h-3 w-3" /> : null}
                              </Button>
                              <div>
                                <h3 className={cn(
                                  "font-medium text-white",
                                  item.completed && "line-through"
                                )}>{item.title}</h3>
                                <div className="flex items-center gap-3 mt-1 text-xs text-white/70">
                                  <div className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {item.time}
                                  </div>
                                  {item.type && (
                                    <Badge className={cn(
                                      "text-[10px] py-0 h-5",
                                      item.type === 'exam' ? "bg-[#ff5555]/10 text-[#ff5555]" :
                                      item.type === 'lecture' ? "bg-[#0062ff]/10 text-[#0062ff]" :
                                      item.type === 'meeting' ? "bg-[#8b5cf6]/10 text-[#8b5cf6]" :
                                      item.type === 'office_hours' ? "bg-[#ffcb6b]/10 text-[#ffcb6b]" :
                                      "bg-gray-700/30 text-gray-300"
                                    )}>
                                      {item.type.replace('_', ' ')}
                                    </Badge>
                                  )}
                                  {item.course && (
                                    <span className="text-[#0062ff]">{item.course}</span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="mt-2 text-sm text-white/70">{item.description}</p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item.id);
                              }}
                              className="h-6 w-6 rounded-full bg-[#151515] hover:bg-[#ff5555]/20 hover:text-[#ff5555] text-gray-400"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </Button>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-12">
                        <CalendarIcon className="mx-auto h-12 w-12 text-white/40 mb-3" />
                        <h3 className="text-lg font-medium text-white">No items scheduled</h3>
                        <p className="text-white/60 mt-1">Add a new planner item to see it here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-white">Weekly Overview</h2>
              <p className="text-white/70">
                Week of {format(weeklyPlan[0]?.date || new Date(), 'MMM d')} - {format(weeklyPlan[6]?.date || new Date(), 'MMM d, yyyy')}
              </p>
            </div>
            
            {/* Mobile View - Vertical Cards */}
            <div className="md:hidden space-y-3">
              {weeklyPlan.map((day) => (
                <div
                  key={day.date.toString()}
                  className={cn(
                    "rounded-lg overflow-hidden bg-[#0c0c0c]/70 backdrop-blur-xl border border-gray-800 flex flex-col",
                    format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && "ring-2 ring-[#00ffd0]/50"
                  )}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div className={cn(
                    "p-2 text-center font-medium flex justify-between items-center",
                    format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
                      ? "bg-[#00ffd0]/20 text-[#00ffd0]" 
                      : "bg-[#151515] text-white"
                  )}>
                    <span className="text-lg">{format(day.date, 'EEE')}</span>
                    <span>{format(day.date, 'MMM d')}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 rounded-full bg-[#00ffd0]/20 hover:bg-[#00ffd0]/30 text-[#00ffd0]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewItem(prev => ({ ...prev, date: day.date }));
                        setIsAddItemDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="p-3 space-y-2">
                    {day.tasks.length > 0 ? (
                      day.tasks
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((task) => (
                          <div 
                            key={task.id} 
                            className={cn(
                              "p-2 rounded-md text-xs flex items-start justify-between",
                              task.completed 
                                ? "bg-[#00ffd0]/10 text-[#00ffd0]" 
                                : task.type === 'exam' 
                                  ? "bg-[#ff5555]/10 text-[#ff5555] border-l-2 border-[#ff5555]" 
                                  : task.type === 'lecture' 
                                    ? "bg-[#0062ff]/10 text-[#0062ff] border-l-2 border-[#0062ff]" 
                                    : task.type === 'meeting' 
                                      ? "bg-[#8b5cf6]/10 text-[#8b5cf6] border-l-2 border-[#8b5cf6]" 
                                      : task.type === 'office_hours'
                                        ? "bg-[#ffcb6b]/10 text-[#ffcb6b] border-l-2 border-[#ffcb6b]"
                                        : "bg-[#151515] text-gray-300 border-l-2 border-gray-500"
                            )}
                          >
                            <div className="flex-1">
                              <div className={cn("font-medium", task.completed && "line-through")}>{task.title}</div>
                              <div className="flex items-center mt-1">
                                <Clock className="h-2 w-2 mr-1" />
                                {task.time}
                              </div>
                              {task.course && (
                                <div className="text-[#0062ff] text-[10px] mt-1">
                                  {task.course}
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleComplete(task.id);
                                }}
                                className="p-1 rounded-full hover:bg-[#151515]"
                              >
                                {task.completed ? 
                                  <Check className="h-3 w-3 text-[#00ffd0]" /> : 
                                  <div className="h-3 w-3 border border-current rounded-full"></div>
                                }
                              </button>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-white/60 text-xs flex items-center justify-center py-2">
                        <CalendarIcon className="h-3 w-3 mr-1.5 opacity-70" />
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop View - Grid Layout */}
            <div className="hidden md:grid grid-cols-7 gap-3">
              {weeklyPlan.map((day) => (
                <div
                  key={day.date.toString()}
                  className={cn(
                    "rounded-lg overflow-hidden bg-[#0c0c0c] border border-gray-800 flex flex-col min-h-[12rem] shadow-lg backdrop-blur-xl transition-all hover:shadow-[#00ffd0]/10",
                    format(day.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && "ring-2 ring-[#00ffd0]/50"
                  )}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div className={cn(
                    "p-2 text-center font-medium",
                    format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
                      ? "bg-[#00ffd0]/20 text-[#00ffd0]" 
                      : "bg-[#151515] text-white"
                  )}>
                    <div className="text-lg">{format(day.date, 'EEE')}</div>
                    <div className="text-xs opacity-80">{format(day.date, 'MMM d')}</div>
                  </div>
                  <div className="flex-1 p-2 overflow-y-auto relative">
                    {day.tasks.length > 0 ? (
                      day.tasks
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((task) => (
                          <div 
                            key={task.id} 
                            className={cn(
                              "p-2 rounded-md text-xs mb-1.5 cursor-pointer transition-all hover:translate-y-[-2px]",
                              task.completed 
                                ? "bg-[#00ffd0]/10 text-[#00ffd0] line-through" 
                                : task.type === 'exam' 
                                  ? "bg-[#ff5555]/10 text-[#ff5555] border-l-2 border-[#ff5555]" 
                                  : task.type === 'lecture' 
                                    ? "bg-[#0062ff]/10 text-[#0062ff] border-l-2 border-[#0062ff]" 
                                    : task.type === 'meeting' 
                                      ? "bg-[#8b5cf6]/10 text-[#8b5cf6] border-l-2 border-[#8b5cf6]" 
                                      : task.type === 'office_hours'
                                        ? "bg-[#ffcb6b]/10 text-[#ffcb6b] border-l-2 border-[#ffcb6b]"
                                        : "bg-[#151515] text-gray-400 border-l-2 border-gray-500"
                            )}
                          >
                            <div className="font-medium truncate">{task.title}</div>
                            <div className="text-[10px] flex items-center mt-1">
                              <Clock className="h-2 w-2 mr-1 flex-shrink-0" />
                              <span className="truncate">{task.time}</span>
                            </div>
                            {task.course && (
                              <div className="text-[10px] mt-1 text-[#0062ff] truncate">
                                {task.course}
                              </div>
                            )}
                          </div>
                        ))
                    ) : (
                      <div className="text-white/60 text-xs text-center flex flex-col items-center justify-center h-full">
                        <CalendarIcon className="h-6 w-6 mb-1 opacity-40" />
                        <span>No items</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-[#00ffd0]/20 hover:bg-[#00ffd0]/30 text-[#00ffd0]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewItem(prev => ({ ...prev, date: day.date }));
                      setIsAddItemDialogOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Weekly Timeline View - Alternate view */}
            <div className="mt-8 hidden lg:block">
              <h3 className="text-lg font-medium mb-4 text-white">Timeline View</h3>
              <div className="relative bg-[#0c0c0c]/70 rounded-lg p-4 backdrop-blur-xl overflow-x-auto border border-gray-800 shadow-lg">
                <div className="grid grid-cols-7 gap-4 min-w-[800px]">
                  {/* Time slots column headers */}
                  {weeklyPlan.map((day) => (
                    <div key={`header-${day.date.toString()}`} className="text-center text-sm font-medium text-white">
                      {format(day.date, 'EEE, MMM d')}
                    </div>
                  ))}
                  
                  {/* Time grid */}
                  {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((timeSlot) => (
                    <React.Fragment key={`timeslot-${timeSlot}`}>
                      {weeklyPlan.map((day) => {
                        // Find tasks that fall in this time range
                        const tasksInTimeSlot = day.tasks.filter(task => {
                          const taskHour = parseInt(task.time.split(':')[0]);
                          const slotHour = parseInt(timeSlot.split(':')[0]);
                          return taskHour >= slotHour && taskHour < slotHour + 2;
                        });
                        
                        return (
                          <div 
                            key={`cell-${day.date.toString()}-${timeSlot}`} 
                            className="border-t border-gray-800/50 pt-2 pb-4 relative min-h-[60px]"
                          >
                            <div className="absolute -left-8 top-2 text-xs text-gray-500">{timeSlot}</div>
                            {tasksInTimeSlot.length > 0 ? (
                              <div className="space-y-1">
                                {tasksInTimeSlot.map(task => (
                                  <div
                                    key={task.id}
                                    className={cn(
                                      "text-xs p-1 rounded border-l-2 truncate",
                                      task.completed 
                                        ? "bg-[#00ffd0]/10 border-[#00ffd0] text-[#00ffd0] line-through" 
                                        : task.type === 'exam' 
                                          ? "bg-[#ff5555]/10 border-[#ff5555] text-[#ff5555]" 
                                          : task.type === 'lecture' 
                                            ? "bg-[#0062ff]/10 border-[#0062ff] text-[#0062ff]" 
                                            : task.type === 'meeting' 
                                              ? "bg-[#8b5cf6]/10 border-[#8b5cf6] text-[#8b5cf6]" 
                                              : task.type === 'office_hours'
                                                ? "bg-[#ffcb6b]/10 border-[#ffcb6b] text-[#ffcb6b]"
                                                : "bg-[#151515] border-gray-500 text-gray-300"
                                    )}
                                  >
                                    <div className="flex items-center">
                                      <span className="font-medium truncate">{task.title}</span>
                                      <span className="ml-auto text-[10px] opacity-70">{task.time}</span>
                                    </div>
                                    {task.course && (
                                      <div className="text-[10px] text-[#0062ff] truncate mt-0.5">
                                        {task.course}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating Add Button (only shows on small screens) */}
      <div className="fixed right-6 bottom-24 md:bottom-24 z-50 md:hidden">
        <Button
          size="icon"
          onClick={() => setIsAddItemDialogOpen(true)}
          className="h-14 w-14 rounded-full bg-[#00ffd0] hover:bg-[#00ffd0]/80 shadow-lg transition-transform hover:scale-105 hover:shadow-[#00ffd0]/20"
        >
          <Plus className="h-6 w-6 text-black" />
        </Button>
      </div>
      
      <LecturerNav />
    </div>
  );
};

export default LecturerPlanner; 