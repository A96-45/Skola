// main/src/pages/Student/assignment/AssignmentView.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Clock, Users, User, Search, X, Send, Download, Upload, Plus, Check,
  AlertCircle, Bell, BookOpen, MessageSquare, Calendar, FileType, Paperclip, Eye,
  ArrowLeft, CheckCircle2, Timer, UserCircle, ChevronDown, ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';

interface Attachment {
  name: string;
  size: string;
  type: string;
  url: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  deadline: string;
  attachments: Attachment[];
  status: 'pending' | 'submitted' | 'graded';
  points?: number;
  totalPoints: number;
  submissionType: 'individual' | 'group';
  instructions: string;
  progress?: number;
}

interface Lecturer {
  id: string;
  name: string;
  department: string;
}

const AssignmentView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLecturerDropdown, setShowLecturerDropdown] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'single'>('list');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(
    location.state?.selectedAssignment || null
  );

  // Sample assignments data
  const [assignments] = useState<Assignment[]>([
    {
      id: '1',
      title: 'Cloud Architecture Design',
      subject: 'Cloud Computing',
      description: 'Design a comprehensive cloud architecture for an e-commerce platform...',
      deadline: '2025-08-02T23:59:59',
      attachments: [
        { name: 'Assignment_Brief.pdf', size: '2.3 MB', type: 'PDF', url: '#' },
        { name: 'Reference_Architecture.png', size: '1.1 MB', type: 'Image', url: '#' }
      ],
      status: 'pending',
      totalPoints: 100,
      submissionType: 'individual',
      instructions: 'Please follow the provided template and ensure all sections are completed...',
      progress: 65
    },
    {
      id: '2',
      title: 'Network Security Analysis',
      subject: 'Cybersecurity',
      description: 'Analyze network security vulnerabilities and propose solutions...',
      deadline: '2025-02-11T23:59:59',
      attachments: [],
      status: 'pending',
      totalPoints: 80,
      submissionType: 'individual',
      instructions: 'Conduct a thorough security analysis...',
      progress: 30
    },
    {
      id: '3',
      title: 'Database Optimization',
      subject: 'Database Management',
      description: 'Optimize database queries and improve performance...',
      deadline: '2025-02-13T23:59:59',
      attachments: [],
      status: 'pending',
      totalPoints: 90,
      submissionType: 'individual',
      instructions: 'Analyze and optimize the given database queries...',
      progress: 80
    }
  ]);

  useEffect(() => {
    // Check if we have a selected assignment from navigation state
    if (location.state?.selectedAssignment) {
      setSelectedAssignment(location.state.selectedAssignment);
      setViewMode('single');
    }
  }, [location.state]);

  const [lecturers] = useState<Lecturer[]>([
    { id: '1', name: 'Dr. Smith', department: 'Computer Science' },
    { id: '2', name: 'Prof. Johnson', department: 'Information Technology' },
    { id: '3', name: 'Dr. Williams', department: 'Software Engineering' }
  ]);

  const handleSubmit = () => {
    if (!selectedLecturer) {
      alert('Please select a lecturer');
      return;
    }
    navigate('/student/assignments/submission', { state: { assignment: selectedAssignment, selectedLecturer } });
  };

  // Render list view of all assignments
  const renderAssignmentsList = () => (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-all"
            onClick={() => {
              setSelectedAssignment(assignment);
              setViewMode('single');
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold mb-2">{assignment.title}</h3>
                <p className="text-indigo-200">{assignment.subject}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Timer size={20} />
                    <span>Due {new Date(assignment.deadline).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-indigo-200 mt-1">Points: {assignment.totalPoints}</p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // If we're in list view, show all assignments
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header user={user} />
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6"
        >
          <div className="max-w-7xl mx-auto">
            <Button
              variant="secondary"
              onClick={() => navigate('/student/dashboard')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">All Assignments</h1>
          </div>
        </motion.div>
        {renderAssignmentsList()}
        <BottomNav />
      </div>
    );
  }

  // If we're in single view and have a selected assignment, show the detailed view
  if (viewMode === 'single' && selectedAssignment) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header user={user} />
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6"
        >
          <div className="max-w-7xl mx-auto">
            <Button
              variant="secondary"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
            >
              <ArrowLeft size={20} />
              Back to All Assignments
            </Button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{selectedAssignment.title}</h1>
                <p className="text-indigo-200">{selectedAssignment.subject}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Timer size={20} />
                    <span>Due {new Date(selectedAssignment.deadline).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-indigo-200 mt-1">Points: {selectedAssignment.totalPoints}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Assignment Details */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="text-indigo-400" />
                  Assignment Description
                </h2>
                <p className="text-gray-300 leading-relaxed">{selectedAssignment.description}</p>
                <div className="mt-4 p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle size={18} className="text-indigo-400" />
                    Instructions
                  </h3>
                  <p className="text-sm text-gray-300">{selectedAssignment.instructions}</p>
                </div>
              </motion.div>

              {/* Assignment Files */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Paperclip className="text-indigo-400" />
                  Assignment Files
                </h2>
                <div className="space-y-3">
                  {selectedAssignment?.attachments?.length > 0 ? (
                    selectedAssignment.attachments.map((file, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between bg-gray-700/50 rounded-xl p-4 hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-600 rounded-lg">
                            <FileType size={20} className="text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-400">{file.type} • {file.size}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            className="p-2 shadow-md shadow-gray-500/20 transform hover:scale-110 active:scale-95 transition-all duration-300 animate-[pulse_4s_infinite]"
                          >
                            <Eye size={20} className="text-gray-400 animate-[pulse_2s_infinite]" />
                          </Button>
                          <Button 
                            variant="secondary" 
                            className="p-2 shadow-md shadow-gray-500/20 transform hover:scale-110 active:scale-95 transition-all duration-300 animate-[pulse_4s_infinite]"
                          >
                            <Download size={20} className="text-gray-400 animate-[bounce_2s_infinite]" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      No attachments available
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Submission */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 h-fit sticky top-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Upload className="text-indigo-400" />
                Submit Assignment
              </h2>
              <div className="space-y-4">
                {/* Lecturer Selection */}
                <div className="relative">
                  <label className="text-sm font-medium mb-2 block">Select Lecturer</label>
                  <Button
                    variant="default"
                    onClick={() => setShowLecturerDropdown(!showLecturerDropdown)}
                    className="w-full flex items-center justify-between p-3 bg-indigo-600 shadow-lg shadow-indigo-500/30 transform hover:scale-105 active:scale-95 transition-all duration-300 animate-[pulse_3s_infinite] text-white"
                  >
                    <div className="flex items-center gap-2">
                      <UserCircle size={20} className="text-white animate-[spin_4s_linear_infinite]" />
                      <span>{selectedLecturer || 'Choose lecturer'}</span>
                    </div>
                    <ChevronDown 
                      size={20} 
                      className={`transition-transform duration-300 ${showLecturerDropdown ? 'rotate-180' : ''}`} 
                    />
                  </Button>
                  <AnimatePresence>
                    {showLecturerDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute w-full mt-2 bg-gray-700 rounded-lg shadow-lg z-10 py-2"
                      >
                        {lecturers.map((lecturer) => (
                          <Button
                            key={lecturer.id}
                            variant="default"
                            onClick={() => {
                              setSelectedLecturer(lecturer.name);
                              setShowLecturerDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left bg-indigo-600 hover:scale-105 transform transition-transform text-white flex flex-col"
                          >
                            <p className="font-medium">{lecturer.name}</p>
                            <p className="text-sm text-indigo-200">{lecturer.department}</p>
                          </Button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button */}
                <Button
                  variant="default"
                  onClick={handleSubmit}
                  className="w-full py-3 flex items-center justify-center gap-2 mt-6 bg-indigo-600 hover:scale-105 transform transition-transform text-white"
                  disabled={!selectedLecturer}
                >
                  <Send size={16} />
                  Submit Assignment
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return null;
};

export default AssignmentView;