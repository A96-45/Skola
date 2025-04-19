import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Send, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  deadline: string;
  attachments: { name: string; size: string; type: string; url: string }[];
  status: 'pending' | 'submitted' | 'graded';
  points?: number;
  totalPoints: number;
  submissionType: 'individual' | 'group';
  instructions: string;
}

const AssignmentSubmission: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { assignment, selectedLecturer } = location.state as { assignment: Assignment; selectedLecturer: string } || {};
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    // Filter for allowed file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      alert('Some files were not added. Only PDF and Word documents are allowed.');
    }
    
    setSubmissionFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (submissionFiles.length === 0) {
      alert('Please upload at least one file');
      return;
    }
    
    // Here you would typically upload the files to your server
    // For now, we'll just simulate the upload
    console.log('Submitting files:', submissionFiles);
    console.log('Assignment:', assignment?.id);
    console.log('Lecturer:', selectedLecturer);
    
    // Navigate back to assignments view after submission
    navigate('/student/assignments');
  };

  if (!assignment || !selectedLecturer) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="p-6 bg-gray-800 text-white">
          <p>Missing assignment or lecturer data</p>
          <Button
            variant="default"
            onClick={() => navigate('/student/assignments')}
            className="mt-4"
          >
            Return to Assignments
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6"
      >
        <div className="max-w-7xl mx-auto">
          <Button
            variant="secondary"
            onClick={() => navigate('/student/assignments')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to Assignment
          </Button>
          <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
          <p className="text-indigo-200">Submitting to: {selectedLecturer}</p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid gap-6">
          {/* File Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6"
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-lg font-medium">Drag and drop your files here</p>
              <p className="text-sm text-gray-400 mb-4">or</p>
              <Button
                variant="default"
                onClick={() => document.getElementById('fileInput')?.click()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Files
              </Button>
              <input
                type="file"
                id="fileInput"
                multiple
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              <p className="mt-4 text-sm text-gray-400">
                Supported formats: PDF, Word documents
              </p>
            </div>
          </motion.div>

          {/* Uploaded Files List */}
          {submissionFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Uploaded Files:</h3>
              <div className="space-y-3">
                {submissionFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-700/50 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-600 rounded-lg">
                        <FileType size={20} className="text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={submissionFiles.length === 0}
            className="w-full py-3 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700"
          >
            <Send size={16} />
            Submit Assignment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSubmission; 