import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Video, BookOpen, Bookmark } from 'lucide-react';

const CourseContent: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract content type from the path
  const contentType = location.pathname.split('/')[3]; // e.g., 'video', 'document', etc.
  
  const renderContent = () => {
    switch (contentType) {
      case 'video':
        return (
          <div className="relative w-full aspect-video bg-black/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800 mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="w-16 h-16 text-[#00ffd0] opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-bold">Video Content</h3>
              <p className="text-gray-400">This is a placeholder for video content #{contentId}</p>
            </div>
          </div>
        );
      
      case 'document':
        return (
          <div className="w-full bg-[#0c0c0c] rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800 mb-6 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-4 rounded-full bg-[#00ffd0]/10">
                <FileText className="w-8 h-8 text-[#00ffd0]" />
              </div>
              <h3 className="text-xl font-bold">Document Content</h3>
            </div>
            <div className="space-y-4">
              <p>This is a placeholder for document content #{contentId}.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris a varius quam, non tempor nisl. Quisque auctor magna vitae sapien tincidunt, nec vulputate dolor aliquam. Fusce id sapien sollicitudin, posuere sem eget, varius felis.</p>
              <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec non metus tincidunt, dignissim nulla sit amet, porta nibh.</p>
            </div>
          </div>
        );
      
      case 'quiz':
        return (
          <div className="w-full bg-[#0c0c0c] rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800 mb-6 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-4 rounded-full bg-[#8b5cf6]/10">
                <Bookmark className="w-8 h-8 text-[#8b5cf6]" />
              </div>
              <h3 className="text-xl font-bold">Quiz Content</h3>
            </div>
            <div className="space-y-4">
              <p>This is a placeholder for quiz content #{contentId}.</p>
              <div className="space-y-4 mt-6">
                <div className="p-4 bg-[#151515] rounded-lg">
                  <p className="font-medium mb-3">1. What is the primary focus of this course?</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                      <span>Answer option 1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                      <span>Answer option 2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                      <span>Answer option 3</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-[#151515] rounded-lg">
                  <p className="font-medium mb-3">2. Which of the following statements is true?</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                      <span>Answer option 1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                      <span>Answer option 2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                      <span>Answer option 3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'assignment':
        return (
          <div className="w-full bg-[#0c0c0c] rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800 mb-6 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-4 rounded-full bg-[#ffcb6b]/10">
                <BookOpen className="w-8 h-8 text-[#ffcb6b]" />
              </div>
              <h3 className="text-xl font-bold">Assignment Content</h3>
            </div>
            <div className="space-y-4">
              <p>This is a placeholder for assignment content #{contentId}.</p>
              <div className="bg-[#151515] rounded-xl p-4 space-y-3">
                <h4 className="text-lg font-medium">Assignment Instructions</h4>
                <p>Complete the following tasks and submit your work as a PDF document.</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Task 1: Research and analyze the given topic.</li>
                  <li>Task 2: Create a diagram to illustrate your findings.</li>
                  <li>Task 3: Write a 500-word summary of your conclusions.</li>
                </ol>
                <div className="mt-6">
                  <p className="text-sm text-gray-400">Deadline: 2 weeks from now</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="w-full bg-[#0c0c0c] rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800 mb-6 p-6">
            <h3 className="text-xl font-bold">Unknown Content Type</h3>
            <p className="text-gray-400">The content type '{contentType}' with ID #{contentId} is not recognized.</p>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white">
      <Header title={`Course ${contentType && contentType.charAt(0).toUpperCase() + contentType.slice(1)}`} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 hover:bg-[#151515] text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
        
        {/* Content */}
        {renderContent()}
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            className="bg-transparent border-gray-800 hover:bg-[#151515] hover:border-[#00ffd0] text-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <Button
            className="bg-[#00ffd0] text-black hover:bg-[#00ffd0]/80"
            onClick={() => {
              // In a real app, mark this content as completed and navigate to next item
              navigate(-1);
            }}
          >
            Mark as Complete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseContent; 