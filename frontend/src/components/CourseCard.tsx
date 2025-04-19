import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Users, Calendar, ArrowRight, LinkIcon, Send, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CourseCardProps {
  id: string;
  title: string;
  code: string;
  instructor: string;
  progress: number;
  nextClass: string;
  students: number;
  color: string;
  imageUrl: string;
  description?: string;
  lecturerId?: number;
  lecturerName?: string;
  lecturerEmail?: string;
  index?: number;
  isLecturer?: boolean;
  onCourseClick: (id: string) => void;
  onDeleteClick: (e: React.MouseEvent, id: string) => void;
  onLinkLecturer?: (e: React.MouseEvent, id: string) => void;
  onEditClick?: (e: React.MouseEvent, id: string) => void;
  onSendNotes?: (id: string, code: string, notes: string) => Promise<void>;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  code,
  instructor,
  progress,
  nextClass,
  students,
  color,
  imageUrl,
  description,
  lecturerId,
  index = 0,
  isLecturer = false,
  onCourseClick,
  onDeleteClick,
  onLinkLecturer,
  onEditClick,
  onSendNotes
}) => {
  const [notesText, setNotesText] = useState('');
  const [sendingNotes, setSendingNotes] = useState(false);

  const handleSendNotes = async () => {
    if (!notesText.trim() || !onSendNotes) return;
    
    setSendingNotes(true);
    try {
      await onSendNotes(id, code, notesText);
      setNotesText('');
    } catch (error) {
      console.error('Error sending notes:', error);
    } finally {
      setSendingNotes(false);
    }
  };

  const handleViewCourse = (e: React.MouseEvent, viewType: 'course' | 'documents' | 'assignments' | 'announcements') => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    // Navigate with the appropriate tab parameter
    onCourseClick(id + (viewType !== 'course' ? `?tab=${viewType}` : ''));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-[#0c0c0c] border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm hover:shadow-lg hover:shadow-[#00ffd0]/20 transition-all duration-300 cursor-pointer"
      onClick={() => onCourseClick(id)}
    >
      {/* Background Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            // Fallback image if the original fails to load
            e.currentTarget.src = '/images/course-default.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              color === 'bg-blue-500' ? 'bg-[#0062ff]/10' :
              color === 'bg-purple-500' ? 'bg-[#8b5cf6]/10' :
              color === 'bg-green-500' ? 'bg-[#00ffd0]/10' :
              'bg-[#ffcb6b]/10'
            }`}>
              <Book className={`w-5 h-5 ${
                color === 'bg-blue-500' ? 'text-[#0062ff]' :
                color === 'bg-purple-500' ? 'text-[#8b5cf6]' :
                color === 'bg-green-500' ? 'text-[#00ffd0]' :
                'text-[#ffcb6b]'
              }`} />
            </div>
            <h3 className="text-lg font-semibold">{code}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">{students} students</span>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-2">{title}</h2>
        
        {/* Display Instructor Name with Connected Status */}
        <div className="flex items-center gap-2 mb-4">
          <p className="text-gray-400 text-sm">
            {isLecturer ? 'Teaching Unit' : `Instructor: ${instructor || 'Not assigned'}`}
          </p>
          {lecturerId && !isLecturer && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
              Connected
            </span>
          )}
        </div>

        {/* Description (if provided) */}
        {description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                color === 'bg-blue-500' ? 'bg-[#0062ff]' :
                color === 'bg-purple-500' ? 'bg-[#8b5cf6]' :
                color === 'bg-green-500' ? 'bg-[#00ffd0]' :
                'bg-[#ffcb6b]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Next Class */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Next class: {nextClass}</span>
        </div>

        {/* Notes section for lecturers */}
        {isLecturer && onSendNotes && (
          <div className="mt-4 border-t border-gray-800 pt-4">
            <h3 className="text-sm font-semibold mb-2">Send Notes to Students</h3>
            <Textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Enter notes for students..."
              className="bg-gray-800 border-gray-700 mb-2 min-h-[80px]"
              onClick={(e) => e.stopPropagation()} // Prevent triggering card click
            />
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleSendNotes();
              }}
              disabled={sendingNotes || !notesText.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#00ffd0] hover:bg-[#00e0b8] text-black"
            >
              {sendingNotes ? (
                <>Sending<span className="animate-pulse">...</span></>
              ) : (
                <>Send Notes <Send className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        )}

        {/* Buttons Row */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {/* Quick Access Buttons */}
          <div className="col-span-1 grid grid-cols-3 gap-1">
            <Button
              variant="outline"
              className="bg-transparent border-gray-800 hover:bg-[#151515] hover:border-blue-400 text-blue-400 hover:text-white transition-all duration-300"
              onClick={(e) => handleViewCourse(e, 'documents')}
            >
              Docs
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-gray-800 hover:bg-[#151515] hover:border-amber-400 text-amber-400 hover:text-white transition-all duration-300"
              onClick={(e) => handleViewCourse(e, 'assignments')}
            >
              Tasks
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-gray-800 hover:bg-[#151515] hover:border-purple-400 text-purple-400 hover:text-white transition-all duration-300"
              onClick={(e) => handleViewCourse(e, 'announcements')}
            >
              News
            </Button>
          </div>
          
          {/* Actions Buttons */}
          <div className="col-span-1 flex gap-2">
            {/* Link Lecturer Button - Show only if not already linked and callback provided */}
            {!lecturerId && onLinkLecturer && !isLecturer && (
              <Button
                variant="outline"
                className="bg-transparent border-gray-800 hover:bg-[#151515] hover:border-purple-400 text-purple-400 hover:text-white transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent onClick
                  onLinkLecturer(e, id);
                }}
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
            )}
            
            {/* Edit Button - Show for both lecturers and students */}
            {onEditClick && (
              <Button
                variant="outline"
                className="bg-transparent border-gray-800 hover:bg-[#151515] hover:border-yellow-500 text-yellow-500 hover:text-white transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent onClick
                  onEditClick(e, id);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            
            {/* Delete Course Button */}
            <Button
              variant="outline"
              className="bg-transparent border-gray-800 hover:bg-[#151515] hover:border-red-500 text-red-500 hover:text-white transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onClick
                onDeleteClick(e, id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard; 