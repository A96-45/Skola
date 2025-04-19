import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket, DocumentData } from '@/context/WebSocketContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

// Define a type for sender
interface Sender {
  id: string;
  name: string;
  role: string;
}

// Updated document type - instead of extending DocumentData, we create a separate interface
interface DocumentWithExtras {
  id?: string;
  title: string;
  documentUrl?: string;
  documentName?: string;
  courseId: string;
  courseCode?: string;
  type: string;
  fromUserId?: string;
  fromUserName?: string;
  timestamp?: Date;
  content: string;
  recipients: string[];
  sender?: Sender;
}

// Mock documents - in a real app, this would come from an API and WebSocket events
const initialDocuments: DocumentWithExtras[] = [
  {
    id: 'doc1',
    title: 'Introduction to Variables',
    documentUrl: 'https://example.com/intro-variables.pdf',
    documentName: 'intro-variables.pdf',
    courseId: 'CS101',
    courseCode: 'CS101',
    type: 'notes',
    fromUserId: 'lecturer1',
    fromUserName: 'Dr. Johnson',
    timestamp: new Date(),
    content: '',
    recipients: [],
    sender: {
      id: 'lecturer1',
      name: 'Dr. Johnson',
      role: 'lecturer'
    }
  },
  {
    id: 'doc2',
    title: 'Control Structures Assignment',
    documentUrl: 'https://example.com/control-structures.pdf',
    documentName: 'control-structures.pdf',
    courseId: 'CS101',
    courseCode: 'CS101',
    type: 'assignment',
    fromUserId: 'lecturer1',
    fromUserName: 'Dr. Johnson',
    timestamp: new Date(),
    content: '',
    recipients: [],
    sender: {
      id: 'lecturer1',
      name: 'Dr. Johnson',
      role: 'lecturer'
    }
  }
];

const StudentDocumentNotifications: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useWebSocket();
  const [documents, setDocuments] = useState<DocumentWithExtras[]>(initialDocuments);
  const [newDocuments, setNewDocuments] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  // Listen for new documents via WebSocket - This is mock logic since we don't have a real server
  useEffect(() => {
    // Simulating receiving a new document after 5 seconds
    const timer = setTimeout(() => {
      const newDoc: DocumentWithExtras = {
        id: 'doc3',
        title: 'Data Types and Operators',
        documentUrl: 'https://example.com/data-types.pdf',
        documentName: 'data-types.pdf',
        courseId: 'CS101',
        courseCode: 'CS101',
        type: 'notes',
        fromUserId: 'lecturer1',
        fromUserName: 'Dr. Johnson',
        timestamp: new Date(),
        content: '',
        recipients: [],
        sender: {
          id: 'lecturer1',
          name: 'Dr. Johnson',
          role: 'lecturer'
        }
      };
      
      setDocuments(prev => [...prev, newDoc]);
      setNewDocuments(prev => [...prev, newDoc.title]);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter documents based on active tab
  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'all') return true;
    return doc.type === activeTab;
  });
  
  // Mark document as viewed
  const handleDocumentView = (title: string) => {
    setNewDocuments(prev => prev.filter(docTitle => docTitle !== title));
  };
  
  return (
    <Card className="w-full max-w-4xl bg-gray-800/40 backdrop-blur-lg border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="text-blue-400" />
          Course Materials & Documents
        </CardTitle>
        <CardDescription className="text-gray-400">
          View the latest documents shared by your lecturers
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-700/50 border-gray-600">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-600">All</TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-blue-600">Notes</TabsTrigger>
            <TabsTrigger value="assignment" className="data-[state=active]:bg-blue-600">Assignments</TabsTrigger>
            <TabsTrigger value="resource" className="data-[state=active]:bg-blue-600">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            {filteredDocuments.length > 0 ? (
              <div className="space-y-3">
                {filteredDocuments.map((doc, index) => (
                  <motion.div
                    key={`${doc.title}-${index}`}
                    initial={newDocuments.includes(doc.title) ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-gray-700/30 backdrop-blur-lg rounded-lg p-4 ${
                      newDocuments.includes(doc.title) ? 'border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`bg-gray-700/50 p-2 rounded-lg ${
                          doc.type === 'notes' ? 'text-blue-400' :
                          doc.type === 'assignment' ? 'text-amber-400' : 'text-green-400'
                        }`}>
                          <FileText size={20} />
                        </div>
                        
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium text-white">{doc.title}</h3>
                            {newDocuments.includes(doc.title) && (
                              <Badge variant="default" className="ml-2 bg-blue-500 text-white">
                                NEW
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-400">{doc.courseCode}</span>
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                              <Clock size={12} />
                              Just now
                            </span>
                          </div>
                          
                          {doc.sender && (
                            <p className="text-sm text-gray-300 mt-2">
                              From: {doc.sender.name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (doc.documentUrl) {
                              window.open(doc.documentUrl, '_blank');
                              handleDocumentView(doc.title);
                            }
                          }}
                        >
                          <ExternalLink size={14} className="mr-1" /> View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDocumentView(doc.title)}
                        >
                          <Download size={14} className="mr-1" /> Download
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-800/30 backdrop-blur-lg rounded-lg">
                <FileText className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300">No Documents Found</h3>
                <p className="text-gray-500 mt-2">
                  {activeTab === 'all' 
                    ? "You haven't received any documents yet" 
                    : `You haven't received any ${activeTab} documents`}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="bg-gray-700/30 p-3 rounded-lg mt-4">
          <p className="text-sm text-gray-400">
            <span className="font-medium text-blue-400">Note:</span> In a complete application, documents would be received in real-time via WebSocket connections. For this demo, we're simulating new document arrivals.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentDocumentNotifications;
