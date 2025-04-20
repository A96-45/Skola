import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Header } from '@/components/Header';
import { Book, Users, Clock, ArrowLeft, ArrowRight, Plus, Calendar, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface University {
  id: string;
  name: string;
  location: string;
  logo: string;
}

const UniversityUnits: React.FC = () => {
  const navigate = useNavigate();
  const { universityId } = useParams<{ universityId: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [university, setUniversity] = useState<University | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    // Fetch university and its units
    const fetchUniversityAndUnits = async () => {
      setLoading(true);
      try {
        // This would be API calls in production
        // For now, we'll use sample data
        
        // Fetch university details
        const universityData: University = {
          id: universityId || "1",
          name: "University of Technology",
          location: "San Francisco, CA",
          logo: "/images/universities/ut-logo.png"
        };
        
        // Fetch units for this university
        const unitsData: Unit[] = [
          {
            id: "1",
            code: "CS101",
            title: "Introduction to Programming",
            description: "Learn the basics of programming with Python and JavaScript.",
            students: 45,
            schedule: "Mon, Wed 10:00-11:30 AM",
            instructor: "Dr. John Smith",
            color: "bg-blue-500",
            imageUrl: "/images/courses/programming.jpg"
          },
          {
            id: "2",
            code: "CS201",
            title: "Data Structures & Algorithms",
            description: "Advanced programming concepts including lists, trees, and graphs.",
            students: 38,
            schedule: "Tue, Thu 2:00-3:30 PM",
            instructor: "Prof. Emily Johnson",
            color: "bg-purple-500",
            imageUrl: "/images/courses/algorithms.jpg"
          },
          {
            id: "3",
            code: "CS301",
            title: "Database Systems",
            description: "Relational database design, SQL, and data modeling.",
            students: 32,
            schedule: "Mon, Fri 1:00-2:30 PM",
            instructor: "Dr. Robert Davis",
            color: "bg-green-500",
            imageUrl: "/images/courses/database.jpg"
          },
          {
            id: "4",
            code: "CS401",
            title: "Web Development",
            description: "Building modern web applications with HTML, CSS, and JavaScript frameworks.",
            students: 28,
            schedule: "Wed, Fri 3:00-4:30 PM",
            instructor: "Prof. Sarah Wilson",
            color: "bg-amber-500",
            imageUrl: "/images/courses/webdev.jpg"
          }
        ];
        
        setUniversity(universityData);
        setUnits(unitsData);
      } catch (error) {
        console.error('Error fetching university data:', error);
        toast({
          title: "Error",
          description: "Failed to load university units. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUniversityAndUnits();
  }, [universityId]);

  const handleEnroll = async (unitId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in units",
        variant: "destructive"
      });
      return;
    }
    
    // This would be an API call in production
    // For now, we'll just show a success message
    
    toast({
      title: "Enrolled Successfully",
      description: `You've been enrolled in the unit. You can now access course materials.`
    });
  };

  const handleViewUnit = (unitId: string) => {
    navigate(`/student/unit/${unitId}`);
  };

  const handleGoBack = () => {
    navigate('/student/courses');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white pb-20">
      <Header title={university?.name || "University Units"} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="p-2 mr-4 hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div>
            <h2 className="text-2xl font-semibold text-white">{university?.name}</h2>
            <p className="text-gray-400">{university?.location}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">Available Units</h3>
          <p className="text-gray-400">Browse available units taught by our faculty</p>
        </div>
        
        {units.length === 0 ? (
          <div className="bg-[#0c0c0c]/80 backdrop-blur-sm border border-gray-800 rounded-xl p-10 text-center">
            <Book className="w-16 h-16 text-[#00ffd0] mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">No Units Available</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              There are no units available for this university at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit, index) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-[#0c0c0c] border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm hover:shadow-lg hover:shadow-[#00ffd0]/20 transition-all duration-300"
              >
                {/* Background Image */}
                <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => handleViewUnit(unit.id)}>
                  <img
                    src={unit.imageUrl}
                    alt={unit.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback image
                      e.currentTarget.src = '/images/courses/default.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        unit.color === 'bg-blue-500' ? 'bg-[#0062ff]/10' :
                        unit.color === 'bg-purple-500' ? 'bg-[#8b5cf6]/10' :
                        unit.color === 'bg-green-500' ? 'bg-[#00ffd0]/10' :
                        'bg-[#ffcb6b]/10'
                      }`}>
                        <Book className={`w-5 h-5 ${
                          unit.color === 'bg-blue-500' ? 'text-[#0062ff]' :
                          unit.color === 'bg-purple-500' ? 'text-[#8b5cf6]' :
                          unit.color === 'bg-green-500' ? 'text-[#00ffd0]' :
                          'text-[#ffcb6b]'
                        }`} />
                      </div>
                      <h3 className="text-lg font-semibold">{unit.code}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">{unit.students} students</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold mb-2">{unit.title}</h2>
                  <p className="text-gray-400 text-sm mb-4">{unit.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{unit.schedule}</span>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-4">
                    Instructor: <span className="font-medium">{unit.instructor}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center justify-center bg-transparent border-gray-800 hover:bg-[#151515] hover:border-[#00ffd0] text-[#00ffd0] hover:text-white transition-all duration-300"
                      onClick={() => handleViewUnit(unit.id)}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    
                    <Button
                      className="flex items-center justify-center bg-[#00ffd0] hover:bg-[#00e0b8] text-black transition-all duration-300"
                      onClick={() => handleEnroll(unit.id)}
                    >
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default UniversityUnits; 