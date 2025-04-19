import React, { useState } from 'react';
import { Video, MapPin, Link as LinkIcon, Calendar, Clock, Users, X, Copy, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useWebSocket } from '@/context/WebSocketContext';
import { Badge } from '@/components/ui/badge';

interface Lesson {
  id: string;
  subject: string;
  time: string;
  venue: string;
  lecturer: string;
  universityId?: string;
  courseId?: string;
}

interface LessonModalProps {
  open: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  isLecturer: boolean;
  onUpdate: (lessonId: string, updates: Partial<Lesson> & {type: 'online'|'physical', link?: string, notes?: string}) => void;
}

const LessonModal: React.FC<LessonModalProps> = ({ 
  open, 
  onClose, 
  lesson, 
  isLecturer, 
  onUpdate 
}) => {
  const { sendNotification } = useWebSocket();
  const [lessonType, setLessonType] = useState<'online' | 'physical'>('physical');
  const [onlineLink, setOnlineLink] = useState('');
  const [venueNotes, setVenueNotes] = useState('');
  const [requirements, setRequirements] = useState('');
  const [sendNotificationToStudents, setSendNotificationToStudents] = useState(true);
  const [showCopiedIndicator, setShowCopiedIndicator] = useState(false);
  
  if (!lesson) return null;
  
  const handleSubmit = () => {
    if (lessonType === 'online' && !onlineLink) {
      toast("Link Required", {
        description: "Please provide a meeting link for the online class"
      });
      return;
    }
    
    const updates: Partial<Lesson> & {type: 'online'|'physical', link?: string, notes?: string, requirements?: string} = {
      type: lessonType,
    };
    
    if (lessonType === 'online') {
      updates.link = onlineLink;
      updates.venue = 'Virtual Meeting';
    } else {
      if (venueNotes) {
        updates.venue = venueNotes;
      }
      updates.notes = venueNotes;
      updates.requirements = requirements;
    }
    
    onUpdate(lesson.id, updates);
    
    if (sendNotificationToStudents && lesson.universityId && lesson.courseId) {
      const notificationTitle = lessonType === 'online' 
        ? `${lesson.subject} is now online` 
        : `Update for ${lesson.subject}`;
        
      const notificationMessage = lessonType === 'online'
        ? `Your ${lesson.subject} class scheduled for ${lesson.time} will be held online. Please use the link provided in your schedule.`
        : `Important update for your ${lesson.subject} class: ${venueNotes ? 'Venue changed to ' + venueNotes + '. ' : ''}${requirements ? 'Requirements: ' + requirements : ''}`;
      
      sendNotification({
        type: 'announcement',
        title: notificationTitle,
        message: notificationMessage,
        universityId: lesson.universityId,
        courseId: lesson.courseId,
        recipients: [] // Empty array means all students in the course will receive it
      });
    }
    
    toast("Class Updated", {
      description: `Class has been set to ${lessonType} mode${sendNotificationToStudents ? ' and students have been notified' : ''}`
    });
    
    onClose();
  };
  
  const handleCopyLink = () => {
    if (onlineLink) {
      navigator.clipboard.writeText(onlineLink);
      setShowCopiedIndicator(true);
      setTimeout(() => setShowCopiedIndicator(false), 2000);
      toast("Link Copied", {
        description: "The meeting link has been copied to your clipboard"
      });
    }
  };
  
  const generateMeetingLink = () => {
    const meetId = Math.random().toString(36).substring(2, 10);
    const newLink = `https://meet.google.com/${meetId}`;
    setOnlineLink(newLink);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{lesson.subject}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 my-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 bg-gray-700/40 p-2 rounded-lg">
              <Clock className="text-blue-400" size={16} />
              <span>{lesson.time}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-700/40 p-2 rounded-lg">
              <MapPin className="text-red-400" size={16} />
              <span>{lesson.venue}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-700/40 p-2 rounded-lg col-span-2">
              <Users className="text-purple-400" size={16} />
              <span>{lesson.lecturer}</span>
            </div>
          </div>
          
          {isLecturer ? (
            <>
              <div className="space-y-3">
                <h3 className="font-medium">Class Setting</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={lessonType === 'online' ? 'default' : 'outline'}
                    className={`flex flex-col items-center justify-center h-24 space-y-2 ${
                      lessonType === 'online' ? 'border-blue-500 bg-blue-900/20' : ''
                    }`}
                    onClick={() => setLessonType('online')}
                  >
                    <Video className={lessonType === 'online' ? 'text-blue-400' : 'text-gray-400'} size={24} />
                    <span>Online Class</span>
                  </Button>
                  
                  <Button
                    variant={lessonType === 'physical' ? 'default' : 'outline'}
                    className={`flex flex-col items-center justify-center h-24 space-y-2 ${
                      lessonType === 'physical' ? 'border-green-500 bg-green-900/20' : ''
                    }`}
                    onClick={() => setLessonType('physical')}
                  >
                    <MapPin className={lessonType === 'physical' ? 'text-green-400' : 'text-gray-400'} size={24} />
                    <span>Physical Class</span>
                  </Button>
                </div>
              </div>
              
              {lessonType === 'online' ? (
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <LinkIcon size={16} />
                    Online Meeting Link
                  </h3>
                  <div className="flex gap-2">
                    <Input
                      value={onlineLink}
                      onChange={(e) => setOnlineLink(e.target.value)}
                      placeholder="Enter Google Meet, Zoom, or other link"
                      className="bg-gray-700 border-gray-600 flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="flex-shrink-0"
                      onClick={handleCopyLink}
                    >
                      {showCopiedIndicator ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </Button>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    onClick={generateMeetingLink}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Generate Meeting Link
                  </Button>
                  <p className="text-xs text-gray-400">
                    This link will be shared with all students enrolled in this class.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <MapPin size={16} />
                    Venue Notes (Optional)
                  </h3>
                  <Input
                    value={venueNotes}
                    onChange={(e) => setVenueNotes(e.target.value)}
                    placeholder="Any changes to the usual venue? (e.g. 'Moved to Room 301')"
                    className="bg-gray-700 border-gray-600"
                  />
                  
                  <h3 className="font-medium flex items-center gap-2 mt-4">
                    <AlertCircle size={16} />
                    Special Requirements (Optional)
                  </h3>
                  <Textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Any special requirements for this class? (e.g. 'Bring laptops', 'Pre-reading required')"
                    className="bg-gray-700 border-gray-600 min-h-20"
                  />
                  
                  <p className="text-xs text-gray-400">
                    Leave blank to keep the existing venue information.
                  </p>
                </div>
              )}
              
              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="notify-students"
                  checked={sendNotificationToStudents}
                  onChange={(e) => setSendNotificationToStudents(e.target.checked)}
                  className="rounded text-blue-500 bg-gray-700 border-gray-600"
                />
                <label htmlFor="notify-students" className="text-sm">
                  Notify enrolled students about this change
                </label>
              </div>
            </>
          ) : (
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {lessonType === 'online' ? (
                  <>
                    <Video className="text-blue-400" size={20} />
                    <h3 className="font-medium">Online Class</h3>
                  </>
                ) : (
                  <>
                    <MapPin className="text-green-400" size={20} />
                    <h3 className="font-medium">Physical Class</h3>
                  </>
                )}
              </div>
              
              {lessonType === 'online' && onlineLink && (
                <div>
                  <p className="text-sm mb-3">Join the virtual classroom using the link below:</p>
                  <a 
                    href={onlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm w-full justify-center"
                  >
                    <LinkIcon size={16} />
                    Join Meeting
                  </a>
                </div>
              )}
              
              {lessonType === 'physical' && (
                <div>
                  <p className="text-sm">This class will be held in person at the venue shown above.</p>
                  {venueNotes && (
                    <p className="mt-2 p-2 bg-amber-900/20 text-amber-400 text-sm rounded border border-amber-800/30">
                      Note: {venueNotes}
                    </p>
                  )}
                  
                  {requirements && (
                    <div className="mt-3">
                      <Badge variant="outline" className="mb-1 bg-gray-800/50">Requirements</Badge>
                      <p className="p-2 bg-blue-900/20 text-blue-400 text-sm rounded border border-blue-800/30">
                        {requirements}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
          
          {isLecturer && (
            <Button onClick={handleSubmit}>
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LessonModal;
