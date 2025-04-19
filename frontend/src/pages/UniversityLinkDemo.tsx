import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import LecturerSendNotes from '@/components/LecturerSendNotes';
import StudentDocumentNotifications from '@/components/StudentDocumentNotifications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

const UniversityLinkDemo: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'lecturer'>('lecturer');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white pb-16 sm:pb-20">
      <div className="p-3 sm:p-4 max-w-7xl mx-auto">
        <div className="flex items-center mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mr-2 p-1 sm:p-2"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">University Link Demo</h1>
        </div>
        
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-300">
            This is a demonstration of the real-time notification system between lecturers and students. 
            You can switch roles to see both perspectives.
          </p>
          
          <div className="flex justify-center mt-3 sm:mt-4">
            <Tabs 
              value={role} 
              onValueChange={(value) => setRole(value as 'student' | 'lecturer')}
              className="w-full max-w-md"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lecturer" className="text-sm sm:text-base">Lecturer View</TabsTrigger>
                <TabsTrigger value="student" className="text-sm sm:text-base">Student View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <motion.div
          key={role}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center"
        >
          {role === 'lecturer' ? (
            <LecturerSendNotes />
          ) : (
            <StudentDocumentNotifications />
          )}
        </motion.div>
        
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-3 sm:p-4 mt-4 sm:mt-6">
          <h2 className="text-base sm:text-lg font-semibold mb-2">How This Demo Works</h2>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-300">
            <li>• In the <strong>Lecturer View</strong>, you can select a course and specify students to send notes to.</li>
            <li>• In the <strong>Student View</strong>, you can see documents received from lecturers.</li>
            <li>• The system simulates real-time communication between lecturers and students.</li>
            <li>• In a complete application, this would use WebSockets to deliver notifications instantly.</li>
            <li>• Documents are targeted to specific students based on course enrollment.</li>
          </ul>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
};

export default UniversityLinkDemo;
