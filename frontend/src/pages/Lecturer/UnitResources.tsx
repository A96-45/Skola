import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Video, ArrowLeft, Upload, Download, Plus, Book, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitAssignmentDialog from '@/components/lecturer/UnitAssignmentDialog';

interface Resource {
  id: string;
  title: string;
  type: 'document' | 'video';
  date: string;
  size: string;
  url: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  submissions: number;
  maxPoints: number;
  status: 'active' | 'draft' | 'ended';
}

interface Unit {
  id: string;
  code: string;
  title: string;
}

const UnitResources: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);

  useEffect(() => {
    // Simulate fetching unit and resources
    const fetchData = async () => {
      setTimeout(() => {
        setUnit({
          id: id || '',
          code: 'CS101',
          title: 'Introduction to Programming'
        });

        setResources([
          {
            id: '1',
            title: 'Week 1: Introduction to Python',
            type: 'document',
            date: '2024-01-15',
            size: '2.4 MB',
            url: '#'
          },
          {
            id: '2',
            title: 'Programming Basics Video Tutorial',
            type: 'video',
            date: '2024-01-16',
            size: '45 MB',
            url: '#'
          }
        ]);

        setAssignments([
          {
            id: '1',
            title: 'Python Basics Exercise',
            description: 'Complete the basic Python exercises',
            dueDate: '2024-02-01',
            dueTime: '23:59',
            submissions: 32,
            maxPoints: 100,
            status: 'active'
          },
          {
            id: '2',
            title: 'Data Structures Assignment',
            description: 'Implement basic data structures',
            dueDate: '2024-02-15',
            dueTime: '23:59',
            submissions: 0,
            maxPoints: 100,
            status: 'draft'
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, [id]);

  const handleUpload = () => {
    toast({
      title: "Coming Soon",
      description: "File upload functionality will be available soon"
    });
  };

  const handleDownload = (resource: Resource) => {
    toast({
      title: "Downloading",
      description: `Downloading ${resource.title}`
    });
  };

  const handleCreateAssignment = async (data: any) => {
    // Implement assignment creation logic
    toast({
      title: "Success",
      description: "Assignment created successfully"
    });
    setShowAssignmentDialog(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00ffd0]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white pb-20">
      <Header />
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/lecturer/units')}
            className="mr-2 p-2 bg-[#151515] hover:bg-[#1d1d1d] text-white hover:text-[#00ffd0]"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{unit?.code} Resources</h1>
            <p className="text-gray-400">{unit?.title}</p>
          </div>
        </div>

        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList className="bg-[#0c0c0c] border border-gray-800 p-1 rounded-xl">
            <TabsTrigger 
              value="resources" 
              className="data-[state=active]:bg-[#151515] data-[state=active]:text-[#00ffd0]"
            >
              Resources
            </TabsTrigger>
            <TabsTrigger 
              value="assignments" 
              className="data-[state=active]:bg-[#151515] data-[state=active]:text-[#00ffd0]"
            >
              Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resources">
            <div className="mb-6">
              <Button 
                onClick={handleUpload}
                className="bg-[#00ffd0] hover:bg-[#00ffd0]/80 text-black font-medium shadow-md shadow-[#00ffd0]/20"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New Resource
              </Button>
            </div>

            <div className="space-y-4">
              {resources.map((resource) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0c0c0c] backdrop-blur-xl rounded-xl p-4 flex items-center justify-between border border-gray-800 hover:shadow-lg hover:shadow-[#00ffd0]/10 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="bg-[#151515] p-2 rounded-lg mr-3">
                      {resource.type === 'document' ? 
                        <FileText className="text-[#0062ff]" size={20} /> : 
                        <Video className="text-[#ff5555]" size={20} />
                      }
                    </div>
                    <div>
                      <h3 className="font-medium">{resource.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span>{new Date(resource.date).toLocaleDateString()}</span>
                        <span>{resource.size}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDownload(resource)}
                    className="bg-[#151515] hover:bg-[#1d1d1d] rounded-full text-[#00ffd0] hover:text-white p-2"
                  >
                    <Download size={18} />
                  </Button>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <div className="mb-6">
              <Button 
                onClick={() => setShowAssignmentDialog(true)}
                className="bg-[#00ffd0] hover:bg-[#00ffd0]/80 text-black font-medium shadow-md shadow-[#00ffd0]/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            </div>

            <div className="space-y-4">
              {assignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0c0c0c] backdrop-blur-xl rounded-xl p-4 border border-gray-800 hover:shadow-lg hover:shadow-[#00ffd0]/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">{assignment.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          assignment.status === 'active' ? 'bg-[#00ffd0]/10 text-[#00ffd0]' :
                          assignment.status === 'draft' ? 'bg-[#ffcb6b]/10 text-[#ffcb6b]' :
                          'bg-[#ff5555]/10 text-[#ff5555]'
                        }`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-400 mt-1">{assignment.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <FileText className="mr-1 h-4 w-4 text-[#0062ff]" />
                          Due: {new Date(`${assignment.dueDate}T${assignment.dueTime}`).toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="mr-1 h-4 w-4 text-[#00ffd0]" />
                          {assignment.submissions} submissions
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/lecturer/assignments/${assignment.id}/grade`)}
                      className="bg-[#151515] hover:bg-[#1d1d1d] border-gray-800 hover:border-[#00ffd0] text-[#00ffd0]"
                    >
                      View & Grade
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <UnitAssignmentDialog 
        isOpen={showAssignmentDialog} 
        onClose={() => setShowAssignmentDialog(false)} 
        onSubmit={handleCreateAssignment}
        unitId={id || ''}
      />
    </div>
  );
};

export default UnitResources;