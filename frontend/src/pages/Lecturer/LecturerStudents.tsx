import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft,
  Users,
  Search,
  Filter,
  Mail,
  MessageSquare,
  Calendar,
  Book,
  CheckCircle,
  ArrowUpDown,
  Edit,
  Building,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { AuthService } from '@/services/ApiService';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  course: string;
  year: number;
  gpa: number;
  attendance: number;
  lastActive: string;
  classes: string[];
}

interface University {
  id: string;
  name: string;
  students: Student[];
}

const LecturerStudents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'gpa' | 'attendance'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  
  useEffect(() => {
    // Fetch students data from API
    const fetchStudents = async () => {
      setLoading(true);
      try {
        if (user?.id) {
          const lecturerId = parseInt(user.id);
          const universitiesData = await AuthService.getLecturerStudents(lecturerId);
          setUniversities(universitiesData);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: "Failed to fetch students",
          description: "Could not connect to server",
          variant: "destructive"
        });
        // Set empty universities array on error
        setUniversities([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [user?.id]);
  
  const handleSort = (criteria: 'name' | 'gpa' | 'attendance') => {
    if (sortBy === criteria) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortDirection('asc');
    }
  };
  
  const handleContactAll = () => {
    toast({
      title: "Message Prepared",
      description: "Now you can message all selected students",
    });
  };

  const handleUniversityClick = (university: University) => {
    setSelectedUniversity(university);
  };

  const handleBackToUniversities = () => {
    setSelectedUniversity(null);
  };
  
  // Get filtered and sorted students from the selected university
  const getFilteredStudents = (): Student[] => {
    if (!selectedUniversity) return [];
    
    return selectedUniversity.students
      .filter(student => {
        // Text search
        const matchesSearch = 
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.course.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Year filter
        const matchesYear = 
          filter === 'all' || 
          filter === student.year.toString();
        
        return matchesSearch && matchesYear;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return sortDirection === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (sortBy === 'gpa') {
          return sortDirection === 'asc'
            ? a.gpa - b.gpa
            : b.gpa - a.gpa;
        } else {
          return sortDirection === 'asc'
            ? a.attendance - b.attendance
            : b.attendance - a.attendance;
        }
      });
  };

  const filteredStudents = getFilteredStudents();
  
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
              onClick={() => navigate('/lecturer/dashboard')}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold">Students</h1>
          </div>
          {selectedUniversity && (
            <Button 
              onClick={handleContactAll}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact All
            </Button>
          )}
        </div>

        {selectedUniversity ? (
          // Show students of selected university
          <>
            <Button
              variant="ghost"
              onClick={handleBackToUniversities}
              className="mb-4 flex items-center"
            >
              <ArrowLeft className="mr-2" size={16} />
              Back to Universities
            </Button>

            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search students by name, email, or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap md:flex-nowrap">
                  <Button 
                    variant={sortBy === 'name' ? 'default' : 'secondary'}
                    onClick={() => handleSort('name')}
                    className="flex gap-1 items-center"
                  >
                    Name
                    {sortBy === 'name' && (
                      <ArrowUpDown size={14} className={`transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </Button>
                  
                  <Button 
                    variant={sortBy === 'gpa' ? 'default' : 'secondary'}
                    onClick={() => handleSort('gpa')}
                    className="flex gap-1 items-center"
                  >
                    GPA
                    {sortBy === 'gpa' && (
                      <ArrowUpDown size={14} className={`transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </Button>
                  
                  <Button 
                    variant={sortBy === 'attendance' ? 'default' : 'secondary'}
                    onClick={() => handleSort('attendance')}
                    className="flex gap-1 items-center"
                  >
                    Attendance
                    {sortBy === 'attendance' && (
                      <ArrowUpDown size={14} className={`transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </Button>
                  
                  <div className="flex gap-1 items-center ml-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                      className="bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Years</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl overflow-hidden">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="mr-2 text-blue-400" size={18} /> 
                  Students List - {selectedUniversity.name}
                  <span className="ml-2 text-sm text-gray-400">({filteredStudents.length} students)</span>
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/30">
                    <tr>
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Course</th>
                      <th className="px-4 py-3 text-center">Year</th>
                      <th className="px-4 py-3 text-center">GPA</th>
                      <th className="px-4 py-3 text-center">Attendance</th>
                      <th className="px-4 py-3 text-center">Last Active</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <motion.tr 
                        key={student.id}
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                        className="border-t border-gray-700/30"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <h4 className="font-medium">{student.name}</h4>
                              <p className="text-sm text-gray-400">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{student.course}</td>
                        <td className="px-4 py-3 text-center">{student.year}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.gpa >= 3.5 
                              ? 'bg-green-500/20 text-green-400' 
                              : student.gpa >= 3.0 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {student.gpa.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full ${
                                student.attendance >= 90 
                                  ? 'bg-green-500' 
                                  : student.attendance >= 80 
                                  ? 'bg-blue-500' 
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${student.attendance}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400 mt-1 block">
                            {student.attendance}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-400 text-sm">
                          {student.lastActive}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="ghost"
                              size="icon"
                              className="text-blue-400 bg-blue-500/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="icon"
                              className="text-purple-400 bg-purple-500/10"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                              onClick={() => navigate(`/lecturer/student/${student.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredStudents.length === 0 && (
                <div className="text-center py-10">
                  <Users className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No Students Found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </>
        ) : (
          // Show universities list
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.length === 0 ? (
              <div className="col-span-3 text-center py-16 bg-gray-800/30 backdrop-blur-lg rounded-xl">
                <Building className="mx-auto h-16 w-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-3">No Students Connected Yet</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  Students need to use your lecturer code to connect with you. You can share your enrollment key with your students.
                </p>
                <Button 
                  onClick={() => navigate('/lecturer/settings')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  View My Enrollment Key
                </Button>
              </div>
            ) : (
              universities.map((university, index) => (
                <motion.div
                  key={university.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/30 backdrop-blur-lg rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-900/20 cursor-pointer transition-all duration-300"
                  onClick={() => handleUniversityClick(university)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <Building className="h-6 w-6 text-blue-400" />
                      </div>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                        {university.students.length} students
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-4">{university.name}</h3>
                    
                    <div className="space-y-3">
                      {university.students.slice(0, 3).map(student => (
                        <div key={student.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="text-gray-300">{student.name}</span>
                          </div>
                          <span className="text-xs text-gray-400">{student.year}th Year</span>
                        </div>
                      ))}
                      
                      {university.students.length > 3 && (
                        <p className="text-sm text-gray-400 italic">
                          + {university.students.length - 3} more students
                        </p>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full mt-4 flex items-center justify-center gap-2 bg-transparent border-gray-700 hover:bg-gray-700/50"
                    >
                      View All Students
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800/50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around py-3">
            {[
              { icon: Calendar, label: 'Home', path: '/lecturer/dashboard' },
              { icon: Book, label: 'Classes', path: '/lecturer/classes' },
              { icon: Users, label: 'Students', path: '/lecturer/students' }
            ].map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 group"
              >
                <item.icon className="text-gray-400 transition-all duration-300 transform group-hover:scale-110 group-hover:text-white" size={24} />
                <span className="text-xs text-gray-400 group-hover:text-white transition-colors duration-300">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerStudents;
