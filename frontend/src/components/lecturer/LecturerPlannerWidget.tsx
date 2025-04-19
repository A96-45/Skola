import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertTriangle, BookOpen, Users, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Storage key for planner data
const PLANNER_STORAGE_KEY = 'LECTURER_PLANNER_DATA';

// Interface for planner items
interface PlannerItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'lecture' | 'assignment' | 'exam' | 'meeting' | 'office_hours' | 'other';
  completed: boolean;
  university?: string;
  course?: string;
}

const LecturerPlannerWidget: React.FC = () => {
  const navigate = useNavigate();
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load planner data from localStorage
  useEffect(() => {
    const loadPlannerData = () => {
      const savedPlanner = localStorage.getItem(PLANNER_STORAGE_KEY);
      if (savedPlanner) {
        try {
          const parsedPlanner = JSON.parse(savedPlanner);
          // Get only upcoming and non-completed items
          const today = new Date();
          const upcomingItems = parsedPlanner
            .filter((item: PlannerItem) => {
              const itemDate = new Date(item.date);
              return !item.completed && 
                (itemDate.toDateString() === today.toDateString() || 
                 itemDate > today);
            })
            .sort((a: PlannerItem, b: PlannerItem) => {
              // Sort by date first, then by time
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              if (dateA.getTime() !== dateB.getTime()) {
                return dateA.getTime() - dateB.getTime();
              }
              return a.time.localeCompare(b.time);
            })
            .slice(0, 3); // Get only the next 3 items
            
          setPlannerItems(upcomingItems);
        } catch (e) {
          console.error('Error parsing planner data', e);
        }
      }
      setLoading(false);
    };
    
    loadPlannerData();
  }, []);

  // Get icon based on item type
  const getItemIcon = (type: PlannerItem['type']) => {
    switch (type) {
      case 'exam': return <AlertTriangle className="h-5 w-5" />;
      case 'lecture': return <BookOpen className="h-5 w-5" />;
      case 'meeting': return <Users className="h-5 w-5" />;
      case 'office_hours': return <Clock className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0c0c0c] border border-gray-800 backdrop-blur-sm rounded-xl p-6 animate-pulse">
        <div className="h-6 w-1/3 bg-[#151515] rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-[#151515] rounded-lg"></div>
          <div className="h-20 bg-[#151515] rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative backdrop-blur-xl rounded-xl overflow-hidden"
    >
      {/* Glass background with multiple layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c]/90 to-black/90 rounded-xl"></div>
      <div className="absolute inset-0 backdrop-blur-xl bg-black/20"></div>
      <div className="absolute inset-0 border border-gray-800 rounded-xl"></div>
      
      {/* Gradient orbs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#8b5cf6]/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#00ffd0]/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      
      <div className="relative p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="text-[#8b5cf6]" size={20} />
            My Planner
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/lecturer/planner')}
            className="text-sm bg-[#151515] hover:bg-[#1d1d1d] border-gray-800 hover:border-[#8b5cf6]/30 
              text-white hover:text-[#8b5cf6] transition-all duration-300 backdrop-blur-sm"
            aria-label="View All"
          >
            <span className="sr-only md:not-sr-only">View All</span>
            <Calendar className="h-4 w-4 md:hidden" />
          </Button>
        </div>

        <div className="space-y-4">
          {plannerItems.length > 0 ? (
            plannerItems.map(item => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="group relative backdrop-blur-md rounded-lg overflow-hidden cursor-pointer"
                onClick={() => navigate('/lecturer/planner')}
              >
                {/* Glass background for each item */}
                <div className={`absolute inset-0 ${
                  item.type === 'exam' 
                    ? 'bg-[#ff5555]/10' 
                    : item.type === 'lecture'
                      ? 'bg-[#00ffd0]/10'
                      : item.type === 'meeting'
                        ? 'bg-[#8b5cf6]/10'
                        : item.type === 'office_hours'
                          ? 'bg-[#ffcb6b]/10'
                          : 'bg-[#151515] group-hover:bg-[#1d1d1d]'
                } transition-colors rounded-lg`}></div>
                <div className={`absolute inset-0 border ${
                  item.type === 'exam'
                    ? 'border-[#ff5555]/20'
                    : item.type === 'lecture'
                      ? 'border-[#00ffd0]/20'
                      : item.type === 'meeting'
                        ? 'border-[#8b5cf6]/20'
                        : item.type === 'office_hours'
                          ? 'border-[#ffcb6b]/20'
                          : 'border-gray-800'
                } rounded-lg`}></div>
                
                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8b5cf6]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                
                <div className="relative p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        item.type === 'exam' ? 'bg-[#ff5555]/20 text-[#ff5555]' : 
                        item.type === 'lecture' ? 'bg-[#00ffd0]/20 text-[#00ffd0]' : 
                        item.type === 'meeting' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 
                        item.type === 'office_hours' ? 'bg-[#ffcb6b]/20 text-[#ffcb6b]' : 
                        'bg-[#151515] text-gray-400'
                      }`}>
                        {getItemIcon(item.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        {item.course && <p className="text-sm text-[#0062ff] mt-1">{item.course}</p>}
                      </div>
                    </div>
                    <Badge className={`${
                      item.type === 'exam' ? 'bg-[#ff5555]/20 text-[#ff5555]' : 
                      item.type === 'lecture' ? 'bg-[#00ffd0]/20 text-[#00ffd0]' : 
                      item.type === 'meeting' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 
                      item.type === 'office_hours' ? 'bg-[#ffcb6b]/20 text-[#ffcb6b]' : 
                      'bg-gray-700/50 text-gray-400'
                    }`}>
                      <span className="capitalize">{item.type.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center text-sm text-white/70">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(item.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                    <Clock className="h-4 w-4 ml-3 mr-1" />
                    <span>{item.time}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400">
              <Calendar className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No upcoming planner items</p>
              <Button 
                variant="link"
                onClick={() => navigate('/lecturer/planner')} 
                className="mt-2 text-[#8b5cf6]"
                aria-label="Add to your planner"
              >
                <span>Add to your planner</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LecturerPlannerWidget;