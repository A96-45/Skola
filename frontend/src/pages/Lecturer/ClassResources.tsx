import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  FileText, 
  Video, 
  Image, 
  Link as LinkIcon, 
  Plus,
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Send,
  Book,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger, 
} from '@/components/ui/dialog';

interface Resource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'image' | 'link';
  size?: string;
  uploadedAt: string;
  views: number;
  url: string;
  shared: boolean;
}

const ClassResources: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [classTitle, setClassTitle] = useState('');
  const [classCode, setClassCode] = useState('');
  const [filter, setFilter] = useState<'all' | 'document' | 'video' | 'image' | 'link'>('all');
  
  // Form state for new resource
  const [newResource, setNewResource] = useState<{
    title: string;
    type: 'document' | 'video' | 'image' | 'link';
    url: string;
  }>({
    title: '',
    type: 'document',
    url: '',
  });
  
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  
  useEffect(() => {
    // Simulate fetching class and resources data
    const fetchData = async () => {
      setTimeout(() => {
        // Mock class data
        if (id === 'cs101') {
          setClassTitle('Introduction to Programming');
          setClassCode('CS101');
        } else if (id === 'cs302') {
          setClassTitle('Advanced Data Structures');
          setClassCode('CS302');
        } else if (id === 'cs303') {
          setClassTitle('Machine Learning Basics');
          setClassCode('CS303');
        } else {
          setClassTitle('Class Title');
          setClassCode(`CLASS${id}`);
        }
        
        // Mock resources
        setResources([
          {
            id: 'r1',
            title: 'Course Syllabus - Spring 2023',
            type: 'document',
            size: '2.4 MB',
            uploadedAt: '2 weeks ago',
            views: 145,
            url: '#',
            shared: true,
          },
          {
            id: 'r2',
            title: 'Introduction to Variables and Data Types',
            type: 'document',
            size: '5.1 MB',
            uploadedAt: '1 week ago',
            views: 98,
            url: '#',
            shared: true,
          },
          {
            id: 'r3',
            title: 'Lecture 1 Recording - Intro to Programming',
            type: 'video',
            size: '128.5 MB',
            uploadedAt: '3 days ago',
            views: 76,
            url: '#',
            shared: true,
          },
          {
            id: 'r4',
            title: 'Python Installation Diagram',
            type: 'image',
            size: '1.2 MB',
            uploadedAt: '5 days ago',
            views: 62,
            url: '#',
            shared: false,
          },
          {
            id: 'r5',
            title: 'Additional Python Learning Resources',
            type: 'link',
            uploadedAt: '1 day ago',
            views: 53,
            url: 'https://docs.python.org/3/',
            shared: true,
          }
        ]);
        
        setLoading(false);
      }, 1000);
    };
    
    fetchData();
  }, [id]);
  
  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="text-blue-400" />;
      case 'video':
        return <Video className="text-red-400" />;
      case 'image':
        return <Image className="text-green-400" />;
      case 'link':
        return <LinkIcon className="text-purple-400" />;
    }
  };
  
  const handleCreateResource = () => {
    // Validate form
    if (!newResource.title.trim()) {
      toast({
        title: "Error",
        description: "Resource title is required",
        variant: "destructive"
      });
      return;
    }
    
    if (newResource.type !== 'link' && !newResource.url) {
      toast({
        title: "Error",
        description: "Please upload a file",
        variant: "destructive"
      });
      return;
    }
    
    if (newResource.type === 'link' && !newResource.url) {
      toast({
        title: "Error",
        description: "URL is required for link resources",
        variant: "destructive"
      });
      return;
    }
    
    // Create new resource
    const resource: Resource = {
      id: `r${resources.length + 1}`,
      title: newResource.title,
      type: newResource.type,
      size: newResource.type !== 'link' ? '3.2 MB' : undefined,
      uploadedAt: 'Just now',
      views: 0,
      url: newResource.url || '#',
      shared: false,
    };
    
    setResources([...resources, resource]);
    
    // Reset form and close dialog
    setNewResource({
      title: '',
      type: 'document',
      url: '',
    });
    
    setShowNewDialog(false);
    
    toast({
      title: "Success",
      description: "Resource added successfully",
    });
  };
  
  const toggleShare = (id: string) => {
    const resource = resources.find(r => r.id === id);
    
    if (resource) {
      setResources(resources.map(r => 
        r.id === id ? { ...r, shared: !r.shared } : r
      ));
      
      toast({
        title: resource.shared ? "Resource Hidden" : "Resource Shared",
        description: `${resource.title} is now ${resource.shared ? 'hidden from' : 'available to'} students`
      });
    }
  };
  
  const sendNotification = (id: string) => {
    const resource = resources.find(r => r.id === id);
    
    if (resource) {
      setCurrentResource(resource);
    }
  };
  
  const deleteResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
    toast({
      title: "Success",
      description: "Resource deleted successfully",
    });
  };
  
  // Apply filters
  const filteredResources = resources.filter(resource => 
    filter === 'all' || resource.type === filter
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-20 px-4">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/lecturer/classes/${id}`)}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{classCode} Resources</h1>
              <p className="text-gray-400">{classTitle}</p>
            </div>
          </div>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 shadow-lg shadow-blue-500/30 transform hover:scale-105 active:scale-95 transition-all duration-300 animate-[pulse_3s_infinite]">
                <Plus className="mr-2 h-4 w-4 animate-spin" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Upload or link to a new resource for your class.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Resource Title</label>
                  <Input
                    id="title"
                    value={newResource.title}
                    onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                    placeholder="Enter resource title"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resource Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['document', 'video', 'image', 'link'] as const).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={newResource.type === type ? 'default' : 'outline'}
                        onClick={() => setNewResource({...newResource, type})}
                        className="flex flex-col py-3 h-auto"
                      >
                        {type === 'document' && <FileText className="mb-1" />}
                        {type === 'video' && <Video className="mb-1" />}
                        {type === 'image' && <Image className="mb-1" />}
                        {type === 'link' && <LinkIcon className="mb-1" />}
                        <span className="text-xs capitalize">{type}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                {newResource.type === 'link' ? (
                  <div className="space-y-2">
                    <label htmlFor="url" className="text-sm font-medium">URL</label>
                    <Input
                      id="url"
                      value={newResource.url}
                      onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                      placeholder="https://example.com"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-gray-600 rounded-lg text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <h3 className="text-sm font-medium">Drop your file here</h3>
                    <p className="text-xs text-gray-400 mt-1 mb-3">
                      or click to browse
                    </p>
                    <Button size="sm" variant="secondary">
                      Choose File
                    </Button>
                  </div>
                )}
                
                <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/40 flex items-start gap-3">
                  <Book className="text-blue-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium">Share with Students</p>
                    <p className="text-xs text-gray-400">
                      All new resources are private by default. You can share them with students after uploading.
                    </p>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowNewDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateResource}>
                  Add Resource
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {(['all', 'document', 'video', 'image', 'link'] as const).map((type) => (
              <Button
                key={type}
                variant={filter === type ? 'default' : 'secondary'}
                onClick={() => setFilter(type)}
                className="whitespace-nowrap"
              >
                {type === 'all' && 'All Types'}
                {type === 'document' && (
                  <><FileText className="mr-2 h-4 w-4" /> Documents</>
                )}
                {type === 'video' && (
                  <><Video className="mr-2 h-4 w-4" /> Videos</>
                )}
                {type === 'image' && (
                  <><Image className="mr-2 h-4 w-4" /> Images</>
                )}
                {type === 'link' && (
                  <><LinkIcon className="mr-2 h-4 w-4" /> Links</>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-5 hover:bg-gray-700/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    {getResourceIcon(resource.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{resource.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span>{resource.uploadedAt}</span>
                      {resource.size && <span>•</span>}
                      {resource.size && <span>{resource.size}</span>}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {resource.views} views
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {resource.shared ? (
                      <Button 
                        variant="default"
                        size="sm"
                        onClick={() => toggleShare(resource.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Shared
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => toggleShare(resource.id)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                      <Download size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => deleteResource(resource.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 bg-gray-800/30 backdrop-blur-lg rounded-xl">
              <FileText className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300">No Resources Found</h3>
              <p className="text-gray-500 mt-2 mb-6">
                {filter === 'all' 
                  ? 'Start by adding your first resource'
                  : `No ${filter} resources found`}
              </p>
              <Button onClick={() => setShowNewDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Resource
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassResources;
