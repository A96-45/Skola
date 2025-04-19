import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Video, 
  Image, 
  Link as LinkIcon, 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  ArrowLeft, 
  Eye, 
  Upload,
  Clock,
  Edit
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'image' | 'link';
  course: string;
  size?: string;
  uploadedAt: string;
  views: number;
  url: string;
}

const LecturerResources: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'document' | 'video' | 'image' | 'link'>('all');
  
  useEffect(() => {
    // Simulate fetching resources data
    const fetchResources = async () => {
      // In a real app, this would be an API call to get resources for this university
      setTimeout(() => {
        setResources([
          {
            id: '1',
            title: 'Introduction to Programming - Syllabus',
            type: 'document',
            course: 'CS101',
            size: '2.4 MB',
            uploadedAt: '2 weeks ago',
            views: 145,
            url: '#'
          },
          {
            id: '2',
            title: 'Database Systems - Lecture Notes',
            type: 'document',
            course: 'CS202',
            size: '5.1 MB',
            uploadedAt: '1 week ago',
            views: 98,
            url: '#'
          },
          {
            id: '3',
            title: 'Web Development - Tutorial Recording',
            type: 'video',
            course: 'CS303',
            size: '128.5 MB',
            uploadedAt: '3 days ago',
            views: 76,
            url: '#'
          },
          {
            id: '4',
            title: 'AI Course - Diagram',
            type: 'image',
            course: 'CS404',
            size: '4.2 MB',
            uploadedAt: '5 days ago',
            views: 62,
            url: '#'
          },
          {
            id: '5',
            title: 'Additional Learning Resources',
            type: 'link',
            course: 'CS101',
            uploadedAt: '1 day ago',
            views: 53,
            url: 'https://example.com/resources'
          }
        ]);
        setLoading(false);
      }, 1000);
    };
    
    fetchResources();
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
  
  const filteredResources = resources
    .filter(resource => 
      (filter === 'all' || resource.type === filter) &&
      (resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.course.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleUpload = () => {
    // In a real application, this would open a file upload dialog
    alert('Upload functionality would be implemented here');
  };
  
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
              onClick={() => navigate(`/lecturer/dashboard`)}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold">Teaching Resources</h1>
          </div>
          <Button 
            onClick={handleUpload}
            className="bg-blue-600 text-white"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Resource
          </Button>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
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
        </div>
        
        <div className="space-y-4">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-4 hover:bg-gray-700/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    {getResourceIcon(resource.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{resource.title}</h3>
                    <p className="text-sm text-gray-400">
                      {resource.course} {resource.size && `• ${resource.size}`}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {resource.uploadedAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {resource.views} views
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 bg-gray-800/40"
                    >
                      <Download size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 bg-red-500/10"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 bg-gray-800/30 backdrop-blur-lg rounded-xl">
              <Search className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300">No Resources Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LecturerResources;
