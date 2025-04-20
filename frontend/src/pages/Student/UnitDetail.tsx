import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Header } from '@/components/Header';
import { Book, Users, Clock, ArrowLeft, FileText, Video, Link2, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNav from '@/components/BottomNav';
import { toast } from '@/components/ui/use-toast';

interface Unit {
  id: string;
  code: string;
  title: string;
  description: string;
  students: number;
  schedule: string;
  instructor: string;
  color: string;
  imageUrl: string;
  university?: string;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'note';
  description?: string;
  url: string;
  createdAt: string;
  fileSize?: string;
}

const UnitDetail: React.FC = () => {
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    // Fetch unit details and resources
    const fetchUnitData = async () => {
      setLoading(true);
      try {
        // This would be API calls in production
        // For now, we'll use sample data
        
        // Fetch unit details
        const unitData: Unit = {
          id: unitId || "1",
          code: "CS101",
          title: "Introduction to Programming",
          description: "A comprehensive introduction to programming concepts using Python and JavaScript. This course covers variables, control structures, functions, and basic object-oriented programming. Students will develop several small applications and learn foundational software development practices.",
          students: 45,
          schedule: "Mon, Wed 10:00-11:30 AM",
          instructor: "Dr. John Smith",
          color: "bg-blue-500",
          imageUrl: "/images/courses/programming.jpg",
          university: "University of Technology"
        };
        
        // Fetch resources for this unit
        const resourcesData: Resource[] = [
          {
            id: "1",
            title: "Introduction to Variables and Data Types",
            type: "pdf",
            description: "Lecture slides covering variables, primitive types, and type conversion",
            url: "/resources/cs101/variables.pdf",
            createdAt: "2023-09-05T14:30:00Z",
            fileSize: "2.4 MB"
          },
          {
            id: "2",
            title: "Control Flow Tutorial",
            type: "video",
            description: "Video tutorial on if/else statements, loops, and switch cases",
            url: "/resources/cs101/control-flow.mp4",
            createdAt: "2023-09-12T10:15:00Z"
          },
          {
            id: "3",
            title: "Python Functions Guide",
            type: "pdf",
            description: "Comprehensive guide to writing functions in Python",
            url: "/resources/cs101/python-functions.pdf",
            createdAt: "2023-09-18T09:00:00Z",
            fileSize: "1.8 MB"
          },
          {
            id: "4",
            title: "JavaScript Basics - MDN Documentation",
            type: "link",
            description: "External resource for JavaScript fundamentals",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
            createdAt: "2023-09-20T15:45:00Z"
          },
          {
            id: "5",
            title: "Week 4 Notes: Object-Oriented Programming",
            type: "note",
            description: "Instructor notes on OOP concepts: classes, objects, inheritance",
            url: "/resources/cs101/oop-notes.html",
            createdAt: "2023-09-27T11:20:00Z"
          }
        ];
        
        setUnit(unitData);
        setResources(resourcesData);
        
        // Check if user is enrolled (would be an API call in production)
        setEnrolled(Math.random() > 0.5); // Randomly set for demo purposes
      } catch (error) {
        console.error('Error fetching unit data:', error);
        toast({
          title: "Error",
          description: "Failed to load unit information. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUnitData();
  }, [unitId]);

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in this unit",
        variant: "destructive"
      });
      return;
    }
    
    // This would be an API call in production
    // For now, we'll just show a success message and update state
    
    setEnrolled(true);
    toast({
      title: "Enrolled Successfully",
      description: `You've been enrolled in ${unit?.code}: ${unit?.title}. You can now access all course materials.`
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleResourceClick = (resource: Resource) => {
    if (!enrolled) {
      toast({
        title: "Enrollment Required",
        description: "Please enroll in this unit to access resources",
        variant: "destructive"
      });
      return;
    }
    
    // Handle resource access based on type
    switch (resource.type) {
      case 'link':
        window.open(resource.url, '_blank');
        break;
      case 'pdf':
      case 'video':
        navigate(`/student/resource/${resource.id}`);
        break;
      case 'note':
        navigate(`/student/notes/${resource.id}`);
        break;
      default:
        console.log('Opening resource:', resource);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white">
        <Header title="Unit Not Found" />
        <div className="container mx-auto px-4 py-16 text-center">
          <Book className="w-16 h-16 text-[#00ffd0] mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Unit Not Found</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-6">
            The unit you're looking for couldn't be found. It may have been removed or you might have the wrong URL.
          </p>
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="bg-transparent border-gray-700 hover:bg-[#151515]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white pb-20">
      <Header title={unit.title} />
      
      {/* Hero section with unit image */}
      <div className="relative w-full h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 overflow-hidden">
        <img
          src={unit.imageUrl}
          alt={unit.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/images/courses/default.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              onClick={handleGoBack}
              className="p-2 mr-4 text-white bg-black/20 backdrop-blur-sm hover:bg-white/10 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="bg-[#00ffd0] text-black px-3 py-1 rounded-full text-sm font-medium">
              {unit.code}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">{unit.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{unit.students} students enrolled</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{unit.schedule}</span>
            </div>
            
            <div>Instructor: {unit.instructor}</div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#1a1a1a] p-1 mb-6">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-[#282828]">
              Overview
            </TabsTrigger>
            <TabsTrigger value="resources" className="rounded-md data-[state=active]:bg-[#282828]">
              Resources
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="p-6 rounded-xl bg-[#0c0c0c]/80 backdrop-blur-sm border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">About This Unit</h2>
              <p className="text-gray-300 mb-4">{unit.description}</p>
              
              <div className="flex justify-center">
                {enrolled ? (
                  <div className="flex items-center text-green-400 bg-green-900/20 px-4 py-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>You are enrolled in this unit</span>
                  </div>
                ) : (
                  <Button
                    className="bg-[#00ffd0] hover:bg-[#00e0b8] text-black py-2 px-6 rounded-lg transition-colors"
                    onClick={handleEnroll}
                  >
                    Enroll in this Unit
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-6 rounded-xl bg-[#0c0c0c]/80 backdrop-blur-sm border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#00ffd0] mt-2 mr-3"></span>
                  <span>Understand fundamental programming concepts and syntax</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#00ffd0] mt-2 mr-3"></span>
                  <span>Write and execute code in Python and JavaScript</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#00ffd0] mt-2 mr-3"></span>
                  <span>Create functions and understand variable scope</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#00ffd0] mt-2 mr-3"></span>
                  <span>Apply object-oriented programming principles</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#00ffd0] mt-2 mr-3"></span>
                  <span>Solve basic programming challenges and build simple applications</span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            {resources.length === 0 ? (
              <div className="text-center py-12 bg-[#0c0c0c]/80 backdrop-blur-sm border border-gray-800 rounded-lg">
                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300">No Resources Available</h3>
                <p className="text-gray-500 mt-2">Resources for this unit will be available soon.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resources.map((resource) => (
                  <div 
                    key={resource.id}
                    onClick={() => handleResourceClick(resource)}
                    className={`p-4 rounded-lg border ${
                      enrolled 
                        ? 'cursor-pointer border-gray-800 bg-[#0c0c0c] hover:bg-[#151515] hover:border-[#00ffd0]/30' 
                        : 'cursor-not-allowed border-gray-800 bg-[#0c0c0c] opacity-70'
                    } transition-all duration-200`}
                  >
                    <div className="flex items-start gap-3">
                      {resource.type === 'pdf' && (
                        <div className="p-2 rounded-lg bg-red-500/10">
                          <FileText className="w-6 h-6 text-red-400" />
                        </div>
                      )}
                      {resource.type === 'video' && (
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Video className="w-6 h-6 text-blue-400" />
                        </div>
                      )}
                      {resource.type === 'link' && (
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Link2 className="w-6 h-6 text-purple-400" />
                        </div>
                      )}
                      {resource.type === 'note' && (
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <FileText className="w-6 h-6 text-green-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-gray-400 text-sm mt-1">{resource.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Added {new Date(resource.createdAt).toLocaleDateString()}</span>
                          {resource.fileSize && <span>{resource.fileSize}</span>}
                        </div>
                      </div>
                      
                      {enrolled && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className={`
                            rounded-full p-2
                            ${resource.type === 'link' 
                              ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/20' 
                              : 'text-[#00ffd0] hover:text-[#00e0b8] hover:bg-[#00ffd0]/10'}
                          `}
                        >
                          {resource.type === 'link' ? (
                            <Link2 className="w-5 h-5" />
                          ) : (
                            <Download className="w-5 h-5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!enrolled && (
              <div className="mt-6 p-4 rounded-lg bg-[#151515] border border-[#00ffd0]/30 text-center">
                <p className="text-gray-300 mb-3">Enroll in this unit to access all resources</p>
                <Button
                  className="bg-[#00ffd0] hover:bg-[#00e0b8] text-black py-2 px-6 rounded-lg transition-colors"
                  onClick={handleEnroll}
                >
                  Enroll Now
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default UnitDetail; 