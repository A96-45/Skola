import React, { useState, useEffect } from 'react';
import { format, parseISO, addDays, getDay } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Clock, BookOpen, Check, Info, Home, FileText, User, AlertTriangle, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '@/components/Header';
import { useNavigate, useLocation } from 'react-router-dom';
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
  type: 'study' | 'assignment' | 'exam' | 'meeting' | 'other';
  completed: boolean;
}

interface DailyPlan {
  date: Date;
  tasks: PlannerItem[];
}

const PLANNER_STORAGE_KEY = 'STUDENT_PLANNER_DATA';

const StudentPlanner: React.FC = () => {
  const { user } = useAuth();
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<DailyPlan[]>([]);
  const [activeTab, setActiveTab] = useState('daily');
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [newItem, setNewItem] = useState<Omit<PlannerItem, 'id' | 'completed'>>({
    title: '',
    description: '',
    date: new Date(),
    time: '',
    type: 'study',
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
      type: 'study',
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
      case 'study': return <BookOpen className="h-5 w-5" />;
      case 'assignment': return <FileText className="h-5 w-5" />;
      case 'exam': return <AlertTriangle className="h-5 w-5" />;
      case 'meeting': return <Users className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white">
      <Header title="Daily Planner" />
      
      <main className="container px-4 pb-28 pt-4">
        <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#0c0c0c] border border-gray-800 backdrop-blur-sm">
            <TabsTrigger value="daily" className="text-sm data-[state=active]:bg-[#151515] data-[state=active]:text-[#00ffd0]">
              <span>Daily View</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-sm data-[state=active]:bg-[#151515] data-[state=active]:text-[#00ffd0]">
              <span>Weekly Plan</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="space-y-4">
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
                <DialogContent className="sm:max-w-[425px] bg-[#0c0c0c] border-gray-800 text-white backdrop-blur-sm">
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
                        placeholder="Study session, Assignment, etc."
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
                        className="bg-[#151515] border-gray-800 text-white resize-none"
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
                          <SelectItem value="study" className="focus:bg-[#151515] focus:text-white">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-[#00ffd0]" />
                              <span>Study</span>
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
                          <SelectItem value="other" className="focus:bg-[#151515] focus:text-white">
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-[#ffcb6b]" />
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
            
            <div className="relative backdrop-blur-xl rounded-xl overflow-hidden">
              {/* Glass background with multiple layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c]/90 to-black/90 rounded-xl"></div>
              <div className="absolute inset-0 backdrop-blur-xl bg-black/20"></div>
              <div className="absolute inset-0 border border-gray-800 rounded-xl"></div>
              
              {/* Gradient orbs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00ffd0]/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#8b5cf6]/5 rounded-full blur-3xl animate-pulse delay-700"></div>
              
              <div className="relative p-6">
                <h2 className="text-2xl font-semibold mb-6">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h2>
                
                {getItemsForSelectedDate().length > 0 ? (
                  <div className="space-y-4">
                    {getItemsForSelectedDate().map((item) => (
                      <div 
                        key={item.id}
                        className="group relative backdrop-blur-md rounded-lg overflow-hidden"
                      >
                        {/* Glass background for each item */}
                        <div className={`absolute inset-0 ${
                          item.type === 'exam' 
                            ? 'bg-[#ff5555]/10' 
                            : item.type === 'assignment'
                              ? 'bg-[#0062ff]/10'
                              : item.type === 'study'
                                ? 'bg-[#00ffd0]/10'
                                : item.type === 'meeting'
                                  ? 'bg-[#8b5cf6]/10'
                                  : 'bg-[#ffcb6b]/10'
                        } transition-colors rounded-lg`}></div>
                        <div className={`absolute inset-0 border ${
                          item.type === 'exam'
                            ? 'border-[#ff5555]/20'
                            : item.type === 'assignment'
                              ? 'border-[#0062ff]/20'
                              : item.type === 'study'
                                ? 'border-[#00ffd0]/20'
                                : item.type === 'meeting'
                                  ? 'border-[#8b5cf6]/20'
                                  : 'border-[#ffcb6b]/20'
                        } rounded-lg`}></div>
                        
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ffd0]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        
                        <div className="relative p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${
                                item.type === 'exam' ? 'bg-[#ff5555]/20 text-[#ff5555]' : 
                                item.type === 'assignment' ? 'bg-[#0062ff]/20 text-[#0062ff]' : 
                                item.type === 'study' ? 'bg-[#00ffd0]/20 text-[#00ffd0]' : 
                                item.type === 'meeting' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 
                                'bg-[#ffcb6b]/20 text-[#ffcb6b]'
                              }`}>
                                {getTypeIcon(item.type)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{item.title}</h3>
                                <div className="flex items-center text-sm text-gray-400 mt-1">
                                  <Clock className="w-4 h-4 mr-1" />{item.time}
                                </div>
                              </div>
                            </div>
                            
                            <Badge className={`${
                              item.type === 'exam' ? 'bg-[#ff5555]/20 text-[#ff5555]' : 
                              item.type === 'assignment' ? 'bg-[#0062ff]/20 text-[#0062ff]' : 
                              item.type === 'study' ? 'bg-[#00ffd0]/20 text-[#00ffd0]' : 
                              item.type === 'meeting' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 
                              'bg-[#ffcb6b]/20 text-[#ffcb6b]'
                            }`}>
                              <span>{item.type}</span>
                            </Badge>
                          </div>
                          
                          {item.description && (
                            <p className="mt-3 text-sm text-gray-300">{item.description}</p>
                          )}
                          
                          <div className="flex justify-between items-center mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleComplete(item.id)}
                              className={`p-0 hover:bg-transparent transition-opacity ${item.completed ? 'text-[#00ffd0]' : 'text-gray-400 hover:text-white'}`}
                              aria-label={item.completed ? "Mark as incomplete" : "Mark as complete"}
                            >
                              <Check className={`h-5 w-5 ${item.completed ? 'opacity-100' : 'opacity-50'}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-0 text-gray-400 hover:text-[#ff5555] hover:bg-transparent"
                              aria-label="Delete item"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <Info className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No items scheduled for today</p>
                    <p className="text-sm mt-1">Click "Add Item" to create a new plan</p>
                  </div>
                )}
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
                    "rounded-lg overflow-hidden bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 flex flex-col",
                    format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && "ring-2 ring-blue-500/50"
                  )}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div className={cn(
                    "p-2 text-center font-medium flex justify-between items-center",
                    format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white" 
                      : "bg-zinc-800/80 text-white"
                  )}>
                    <span className="text-lg">{format(day.date, 'EEE')}</span>
                    <span>{format(day.date, 'MMM d')}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 rounded-full bg-zinc-700/60 hover:bg-zinc-600 text-zinc-300"
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
                                ? "bg-emerald-900/30 text-emerald-300" 
                                : task.type === 'exam' 
                                  ? "bg-red-900/30 text-red-300 border-l-2 border-red-500" 
                                  : task.type === 'assignment' 
                                    ? "bg-amber-900/30 text-amber-300 border-l-2 border-amber-500" 
                                    : task.type === 'meeting' 
                                      ? "bg-blue-900/30 text-blue-300 border-l-2 border-blue-500" 
                                      : "bg-zinc-700/30 text-zinc-300 border-l-2 border-zinc-500"
                            )}
                          >
                            <div className="flex-1">
                              <div className={cn("font-medium", task.completed && "line-through")}>{task.title}</div>
                              <div className="flex items-center mt-1">
                                <Clock className="h-2 w-2 mr-1" />
                                {task.time}
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleComplete(task.id);
                                }}
                                className="p-1 rounded-full hover:bg-zinc-600/50"
                              >
                                {task.completed ? 
                                  <Check className="h-3 w-3" /> : 
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
                    "rounded-lg overflow-hidden bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 flex flex-col min-h-[12rem]",
                    format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && "ring-2 ring-blue-500/50"
                  )}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div className={cn(
                    "p-2 text-center font-medium",
                    format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white" 
                      : "bg-zinc-800/80 text-white"
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
                                ? "bg-emerald-900/30 text-emerald-300 line-through" 
                                : task.type === 'exam' 
                                  ? "bg-red-900/30 text-red-300 border-l-2 border-red-500" 
                                  : task.type === 'assignment' 
                                    ? "bg-amber-900/30 text-amber-300 border-l-2 border-amber-500" 
                                    : task.type === 'meeting' 
                                      ? "bg-blue-900/30 text-blue-300 border-l-2 border-blue-500" 
                                      : "bg-zinc-700/30 text-zinc-300 border-l-2 border-zinc-500"
                            )}
                          >
                            <div className="font-medium truncate">{task.title}</div>
                            <div className="text-[10px] flex items-center mt-1">
                              <Clock className="h-2 w-2 mr-1 flex-shrink-0" />
                              <span className="truncate">{task.time}</span>
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
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-zinc-700/60 hover:bg-zinc-600 text-zinc-300"
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
              <div className="relative bg-zinc-800/40 rounded-lg p-4 backdrop-blur-sm overflow-x-auto">
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
                            className="border-t border-zinc-700/50 pt-2 pb-4 relative min-h-[60px]"
                          >
                            <div className="absolute -left-8 top-2 text-xs text-zinc-500">{timeSlot}</div>
                            {tasksInTimeSlot.length > 0 ? (
                              <div className="space-y-1">
                                {tasksInTimeSlot.map(task => (
                                  <div
                                    key={task.id}
                                    className={cn(
                                      "text-xs p-1 rounded border-l-2 truncate",
                                      task.completed 
                                        ? "bg-emerald-900/20 border-emerald-500 text-emerald-300 line-through" 
                                        : task.type === 'exam' 
                                          ? "bg-red-900/20 border-red-500 text-red-300" 
                                          : task.type === 'assignment' 
                                            ? "bg-amber-900/20 border-amber-500 text-amber-300" 
                                            : task.type === 'meeting' 
                                              ? "bg-blue-900/20 border-blue-500 text-blue-300" 
                                              : "bg-zinc-800/70 border-zinc-500 text-zinc-300"
                                    )}
                                  >
                                    <div className="flex items-center">
                                      <span className="font-medium truncate">{task.title}</span>
                                      <span className="ml-auto text-[10px] opacity-70">{task.time}</span>
                                    </div>
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
      </main>
      
      {/* Custom Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-zinc-900 border-t border-zinc-700 md:hidden shadow-xl">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => navigate('/student/dashboard')}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full",
              location.pathname === '/student/dashboard' 
                ? "text-blue-400 font-medium" 
                : "text-white hover:text-blue-200"
            )}
          >
            <Home className={cn(
              "h-5 w-5 mb-1",
              location.pathname === '/student/dashboard' ? "text-blue-400" : "text-white"
            )} />
            <span className="text-xs">Home</span>
          </button>
          
          <button
            onClick={() => navigate('/student/courses')}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full",
              location.pathname === '/student/courses' 
                ? "text-blue-400 font-medium" 
                : "text-white hover:text-blue-200"
            )}
          >
            <FileText className={cn(
              "h-5 w-5 mb-1",
              location.pathname === '/student/courses' ? "text-blue-400" : "text-white"
            )} />
            <span className="text-xs">Notes</span>
          </button>
          
          <button
            onClick={() => navigate('/student/planner')}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full",
              location.pathname === '/student/planner' 
                ? "text-blue-400 font-medium" 
                : "text-white hover:text-blue-200"
            )}
          >
            <Calendar className={cn(
              "h-5 w-5 mb-1",
              location.pathname === '/student/planner' ? "text-blue-400" : "text-white"
            )} />
            <span className="text-xs">Planner</span>
          </button>
          
          <button
            onClick={() => navigate('/student/profile')}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full",
              location.pathname === '/student/profile' 
                ? "text-blue-400 font-medium" 
                : "text-white hover:text-blue-200"
            )}
          >
            <User className={cn(
              "h-5 w-5 mb-1",
              location.pathname === '/student/profile' ? "text-blue-400" : "text-white"
            )} />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentPlanner; 