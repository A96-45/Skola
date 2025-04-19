import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Clock, FileText, Users, CheckCircle, Send, BookOpen, MessageSquare, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface UnitCardProps {
  id: string;
  title: string;
  description: string;
  progress?: number;
  duration: string;
  itemCount: number;
  colorScheme?: string;
  completed?: boolean;
  studentsCount?: number;
  showNotes?: boolean;
  showDocuments?: boolean;
  showAssignments?: boolean;
  nextClass?: string;
  onNotesSubmit?: (id: string, notes: string) => void;
  onClick: (id: string, tab?: string) => void;
}

const UnitCard: React.FC<UnitCardProps> = ({
  id,
  title,
  description,
  progress = 0,
  duration,
  itemCount,
  colorScheme = 'bg-blue-500',
  completed = false,
  studentsCount = 0,
  showNotes = false,
  showDocuments = false,
  showAssignments = false,
  nextClass = 'Not scheduled',
  onNotesSubmit,
  onClick
}) => {
  const [notes, setNotes] = useState('');
  const [isSending, setIsSending] = useState(false);

  const getColorClass = (colorName: string) => {
    switch(colorName) {
      case 'bg-blue-500':
        return {
          bg: 'bg-[#0062ff]/10',
          text: 'text-[#0062ff]',
          border: 'border-[#0062ff]',
          accent: '#0062ff'
        };
      case 'bg-purple-500':
        return {
          bg: 'bg-[#8b5cf6]/10',
          text: 'text-[#8b5cf6]',
          border: 'border-[#8b5cf6]',
          accent: '#8b5cf6'
        };
      case 'bg-green-500':
        return {
          bg: 'bg-[#00ffd0]/10',
          text: 'text-[#00ffd0]',
          border: 'border-[#00ffd0]',
          accent: '#00ffd0'
        };
      case 'bg-amber-500':
        return {
          bg: 'bg-[#ffcb6b]/10',
          text: 'text-[#ffcb6b]',
          border: 'border-[#ffcb6b]',
          accent: '#ffcb6b'
        };
      default:
        return {
          bg: 'bg-[#00ffd0]/10',
          text: 'text-[#00ffd0]',
          border: 'border-[#00ffd0]',
          accent: '#00ffd0'
        };
    }
  };

  const colors = getColorClass(colorScheme);
  
  const handleSendNotes = async () => {
    if (!notes.trim() || !onNotesSubmit) return;
    
    setIsSending(true);
    try {
      await onNotesSubmit(id, notes);
      setNotes('');
    } finally {
      setIsSending(false);
    }
  };

  const handleViewContent = (e: React.MouseEvent, tab: string) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    onClick(id, tab);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "bg-[#0c0c0c] border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm hover:shadow-lg transition-all duration-300",
        colors.border,
        colors.accent
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick(id);
      }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", colors.bg)}>
              <Book className={cn("w-5 h-5", colors.text)} />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          
          {studentsCount > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">{studentsCount} students</span>
            </div>
          )}
          
          {completed ? (
            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-none">
              <CheckCircle className="h-3 w-3 mr-1" /> Completed
            </Badge>
          ) : (
            <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-none">
              In Progress
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-1.5 bg-gray-800"
            style={{ color: colors.accent }}
          />
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="text-sm text-gray-400">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </div>
        </div>
        
        {nextClass && (
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Clock className="w-4 h-4" />
            <span>Next class: {nextClass}</span>
          </div>
        )}
        
        {showNotes && onNotesSubmit && (
          <div className="mt-4 border-t border-gray-800 pt-4 mb-4">
            <h3 className="text-sm font-semibold mb-2">Send Notes to Students</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes for students..."
              className="bg-gray-800 border-gray-700 mb-2 min-h-[80px]"
            />
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleSendNotes();
              }}
              disabled={isSending || !notes.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#00ffd0] hover:bg-[#00e0b8] text-black"
            >
              {isSending ? (
                <>Sending<span className="animate-pulse">...</span></>
              ) : (
                <>Send Notes <Send className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-1 mt-4 border-t border-gray-800 pt-4">
          {showDocuments && (
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-gray-800 hover:bg-[#151515] hover:border-blue-400 text-blue-400 hover:text-white transition-all duration-300"
              onClick={(e) => handleViewContent(e, 'documents')}
            >
              <FileText className="w-3.5 h-3.5 mr-1" /> Docs
            </Button>
          )}
          {showAssignments && (
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-gray-800 hover:bg-[#151515] hover:border-amber-400 text-amber-400 hover:text-white transition-all duration-300"
              onClick={(e) => handleViewContent(e, 'assignments')}
            >
              <BookOpen className="w-3.5 h-3.5 mr-1" /> Tasks
            </Button>
          )}
          {showNotes && (
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-gray-800 hover:bg-[#151515] hover:border-green-400 text-green-400 hover:text-white transition-all duration-300"
              onClick={(e) => handleViewContent(e, 'notes')}
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Notes
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UnitCard; 