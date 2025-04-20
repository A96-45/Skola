import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Building, School, GraduationCap, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from '@/components/BottomNav';
import { toast } from '@/components/ui/use-toast';

interface University {
  id: string;
  name: string;
  location: string;
  logo: string;
  unitCount: number;
  color: string;
}

const StudentCourses: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<University[]>([]);

  useEffect(() => {
    // Fetch available universities
    const fetchUniversities = async () => {
      setLoading(true);
      try {
        // This would be an API call in production
        // For now, we'll use sample data
        const universityData: University[] = [
          {
            id: "1",
            name: "University of Technology",
            location: "San Francisco, CA",
            logo: "/images/universities/ut-logo.png",
            unitCount: 24,
            color: "from-blue-500 to-blue-700"
          },
          {
            id: "2",
            name: "National Science University",
            location: "Boston, MA",
            logo: "/images/universities/nsu-logo.png",
            unitCount: 18,
            color: "from-purple-500 to-purple-700"
          },
          {
            id: "3",
            name: "Global Institute of Technology",
            location: "New York, NY",
            logo: "/images/universities/git-logo.png",
            unitCount: 32,
            color: "from-emerald-500 to-emerald-700"
          },
          {
            id: "4",
            name: "Innovation State University",
            location: "Austin, TX",
            logo: "/images/universities/isu-logo.png",
            unitCount: 15,
            color: "from-amber-500 to-amber-700"
          },
          {
            id: "5",
            name: "Pacific College of Engineering",
            location: "Seattle, WA",
            logo: "/images/universities/pce-logo.png",
            unitCount: 21,
            color: "from-cyan-500 to-cyan-700"
          },
          {
            id: "6",
            name: "Metropolitan University",
            location: "Chicago, IL",
            logo: "/images/universities/mu-logo.png",
            unitCount: 29,
            color: "from-red-500 to-red-700"
          }
        ];
        
        setUniversities(universityData);
      } catch (error) {
        console.error('Error fetching universities:', error);
        toast({
          title: "Error",
          description: "Failed to load universities. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  const handleUniversitySelect = (universityId: string) => {
    // Navigate to university units page
    navigate(`/student/university/${universityId}/units`);
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
      <Header title="Select Institution" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Select Your Institution</h2>
          <p className="text-gray-400">Choose your university to browse available course units</p>
        </div>
        
        {universities.length === 0 ? (
          <div className="bg-[#0c0c0c]/80 backdrop-blur-sm border border-gray-800 rounded-xl p-10 text-center">
            <School className="w-16 h-16 text-[#00ffd0] mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">No Institutions Available</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              There are no institutions available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((university, index) => (
              <motion.div
                key={university.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full"
              >
                <Card 
                  className="h-full bg-gradient-to-br bg-opacity-20 cursor-pointer hover:shadow-lg transition-all duration-300 border-zinc-800 overflow-hidden"
                  onClick={() => handleUniversitySelect(university.id)}
                >
                  <div className={`h-28 bg-gradient-to-r ${university.color} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white text-xl">{university.name}</h3>
                        <p className="text-gray-400 mt-1">{university.location}</p>
                      </div>
                      <div className="bg-zinc-800 px-2 py-1 rounded-full text-xs text-cyan-300 flex items-center">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        {university.unitCount} Units
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between mt-4 text-[#00ffd0] hover:text-[#00ffd0] hover:bg-zinc-800"
                    >
                      <span>View Available Units</span>
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default StudentCourses;