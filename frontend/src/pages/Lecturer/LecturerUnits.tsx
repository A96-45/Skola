import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, Users, Clock, ArrowLeft, ArrowRight, Plus, Calendar, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AuthService } from '@/services/ApiService';

interface Unit {
  id: string;
  code: string;
  title: string;
  description: string;
  students: number;
  schedule: string;
  progress: number;
  color: string;
  imageUrl: string;
  university?: string;
}

const LecturerUnits: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<Unit[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notesText, setNotesText] = useState<{ [key: string]: string }>({});
  const [sendingNotes, setSendingNotes] = useState<{ [key: string]: boolean }>({});
  const [newUnit, setNewUnit] = useState<Omit<Unit, 'id'>>({
    code: '',
    title: '',
    description: '',
    students: 0,
    schedule: '',
    progress: 0,
    color: 'bg-blue-500',
    imageUrl: '/images/courses/default.jpg'
  });
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);
      try {
        // Try to load cached data first
        const cachedUnitsKey = `lecturer_units_${user?.id}`;
        const cachedUnitsData = localStorage.getItem(cachedUnitsKey);
        let unitsList: Unit[] = [];
        
        if (cachedUnitsData) {
          try {
            const parsedCache = JSON.parse(cachedUnitsData);
            if (Array.isArray(parsedCache)) {
              unitsList = parsedCache;
              // Set units immediately from cache for faster loading
              setUnits(unitsList);
            }
          } catch (cacheError) {
            console.error('Error parsing cached units:', cacheError);
          }
        }
        
        // Try to call the API to get fresh lecturer units
        if (user?.id) {
          try {
            const lecturerId = parseInt(user.id);
            const unitsData = await AuthService.getLecturerUnits(lecturerId);
            
            if (unitsData && unitsData.length > 0) {
              // Transform the API response to match our Unit interface
              unitsList = unitsData.map((unit: any) => ({
                id: unit.id.toString(),
                code: unit.code,
                title: unit.title,
                description: unit.description || `Course for ${unit.title}`,
                students: unit.students || 0,
                schedule: unit.schedule || 'Not scheduled',
                progress: unit.progress || 0,
                color: unit.color || 'bg-blue-500',
                imageUrl: unit.imageUrl || `/images/courses/default.jpg`,
                university: unit.university
              }));
              
              // Update state with fresh data from API
              setUnits(unitsList);
              
              // Cache the fresh data
              localStorage.setItem(cachedUnitsKey, JSON.stringify(unitsList));
            }
          } catch (apiError) {
            console.error('API call failed:', apiError);
            // If API fails but we already loaded cached data, keep using that
            if (unitsList.length === 0) {
              toast({
                title: "Working Offline",
                description: "Using cached data. Some features may be limited.",
                variant: "default"
              });
            }
          }
        }
        
        if (unitsList.length === 0) {
          console.log("No units found, using empty array");
          toast({
            title: "No units found",
            description: "Use the + button to add your first unit",
          });
        }
      } catch (error: any) {
        console.error('Error in fetchUnits:', error);
        // Fallback to empty units array
        setUnits([]);
        
        toast({
          title: "Working Offline",
          description: "You can still add and manage units",
          variant: "default"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [user?.id]);

  const handleAddUnit = async () => {
    if (!newUnit.code || !newUnit.title) {
      toast({
        title: "Error",
        description: "Course code and title are required",
        variant: "destructive"
      });
      return;
    }
    
    // Enable loading state
    setLoading(true);
    
    try {
      // Generate a default image path based on the unit code
      let imageUrl = `/images/courses/${newUnit.code.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      
      // Fallback image with random category based on unit code
      const categories = ['programming', 'database', 'webdev', 'ai', 'networking', 'math'];
      const randomCategory = categories[Math.abs(newUnit.code.charCodeAt(0) + newUnit.code.charCodeAt(newUnit.code.length - 1)) % categories.length];
      
      // Use a random placeholder image
      const fallbackUrl = `https://source.unsplash.com/random/800x450/?${randomCategory},${newUnit.code.toLowerCase()}`;
      imageUrl = fallbackUrl;
      
      if (!user?.id) {
        throw new Error("You must be logged in to add a unit");
      }
      
      const lecturer_id = parseInt(user.id);
      const university_id = user.university_id || '1';
      
      // Add the unit using the API
      const result = await AuthService.addNewTeachingCourse(
        lecturer_id,
        university_id,
        newUnit.code,
        newUnit.title,
        newUnit.description || `Course for ${newUnit.title}`,
        newUnit.color,
        imageUrl
      );
      
      if (!result || !result.unit_id) {
        throw new Error("Failed to create unit");
      }
      
      // Create a complete new unit object with all required fields
      const newUnitWithId: Unit = {
        id: result.unit_id.toString(),
        code: newUnit.code,
        title: newUnit.title,
        description: result.description || `Course for ${newUnit.title}`,
        students: 0,
        schedule: 'Not scheduled',
        progress: 0,
        color: result.color || newUnit.color,
        imageUrl: result.image_url || imageUrl,
        university: user.university_name || 'University'
      };

      // Add the new unit to the beginning of the list so it's immediately visible
      const updatedUnits = [newUnitWithId, ...units];
      setUnits(updatedUnits);
      
      // Update the cache
      const cachedUnitsKey = `lecturer_units_${user.id}`;
      localStorage.setItem(cachedUnitsKey, JSON.stringify(updatedUnits));
      
      // Reset the form to defaults
      setNewUnit({
        code: '',
        title: '',
        description: '',
        students: 0,
        schedule: '',
        progress: 0,
        color: 'bg-blue-500',
        imageUrl: '/images/courses/default.jpg'
      });
      
      toast({
        title: "Course Added",
        description: `${newUnit.code} - ${newUnit.title} has been added successfully`
      });
      
      // Close the form modal
      setShowAddForm(false);
    } catch (error: any) {
      console.error("Error adding unit:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || error.message || "Failed to add course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotes = async (unitId: string, unitCode: string) => {
    const notes = notesText[unitId];
    if (!notes?.trim()) {
      toast({
        title: "Error",
        description: "Notes cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setSendingNotes(prev => ({ ...prev, [unitId]: true }));
    try {
      // Try to call the API to send notes
      try {
        const lecturer_id = parseInt(user?.id || '1');
        
        // Call the API to send notes
        await AuthService.sendNotes(
          lecturer_id,
          unitCode,
          notes
        );
      } catch (apiError) {
        console.error('API call failed when sending notes:', apiError);
        // Continue despite API failure
      }
      
      toast({
        title: "Success",
        description: "Notes sent successfully"
      });
      
      // Clear the notes text for this unit
      setNotesText(prev => ({ ...prev, [unitId]: '' }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to send notes",
        variant: "destructive"
      });
    } finally {
      setSendingNotes(prev => ({ ...prev, [unitId]: false }));
    }
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsEditing(true);
  };

  const handleUpdateUnit = async () => {
    if (!editingUnit || !user?.id) {
      toast({
        title: "Error",
        description: "Unable to update unit information",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const lecturer_id = parseInt(user.id);
      const unit_id = parseInt(editingUnit.id);
      
      // Update the unit using the API
      const result = await AuthService.updateTeachingUnit(
        lecturer_id,
        unit_id,
        {
          name: editingUnit.title,
          description: editingUnit.description,
          color: editingUnit.color,
          image_url: editingUnit.imageUrl,
          schedule: editingUnit.schedule,
          progress: editingUnit.progress
        }
      );
      
      if (!result) {
        throw new Error("Failed to update unit");
      }
      
      // Update the unit in the local state
      const updatedUnits = units.map(u => 
        u.id === editingUnit.id ? editingUnit : u
      );
      setUnits(updatedUnits);
      
      // Update the cache
      const cachedUnitsKey = `lecturer_units_${user.id}`;
      localStorage.setItem(cachedUnitsKey, JSON.stringify(updatedUnits));
      
      toast({
        title: "Course Updated",
        description: `${editingUnit.code} - ${editingUnit.title} has been updated successfully`
      });
      
      // Reset editing state
      setEditingUnit(null);
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating unit:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || error.message || "Failed to update course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to delete a unit",
        variant: "destructive"
      });
      return;
    }
    
    if (!confirm("Are you sure you want to delete this unit? This action cannot be undone.")) {
      return;
    }
    
    setLoading(true);
    
    try {
      const lecturer_id = parseInt(user.id);
      const unit_id = parseInt(unitId);
      
      // Delete the unit using the API
      await AuthService.deleteTeachingUnit(lecturer_id, unit_id);
      
      // Remove the unit from the local state
      const updatedUnits = units.filter(u => u.id !== unitId);
      setUnits(updatedUnits);
      
      // Update the cache
      const cachedUnitsKey = `lecturer_units_${user.id}`;
      localStorage.setItem(cachedUnitsKey, JSON.stringify(updatedUnits));
      
      toast({
        title: "Course Deleted",
        description: "The course has been successfully deleted"
      });
    } catch (error: any) {
      console.error("Error deleting unit:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || error.message || "Failed to delete course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingUnit(null);
    setIsEditing(false);
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
      <Header title="My Units" />
      <div className="container mx-auto px-4 py-8">
        {units.length === 0 ? (
          <div className="bg-[#0c0c0c]/80 backdrop-blur-sm border border-gray-800 rounded-xl p-10 text-center">
            <Book className="w-16 h-16 text-[#00ffd0] mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">No Units Added Yet</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              You haven't added any teaching units yet. Start by adding your first course unit using the button below.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-[#00ffd0] hover:bg-[#00e0b8] text-black py-2 px-6 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Your First Course
            </Button>
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
                <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => navigate(`/lecturer/units/${unit.id}/resources`)}>
                  <img
                    src={unit.imageUrl}
                    alt={unit.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback image if the original fails to load
                      e.currentTarget.src = '/images/courses/default.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => navigate(`/lecturer/units/${unit.id}/resources`)}>
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

                  <h2 className="text-xl font-bold mb-2 cursor-pointer" onClick={() => navigate(`/lecturer/units/${unit.id}/resources`)}>{unit.title}</h2>
                  {unit.university && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-400">University: {unit.university}</span>
                    </div>
                  )}
                  <p className="text-gray-400 text-sm mb-4 cursor-pointer" onClick={() => navigate(`/lecturer/units/${unit.id}/resources`)}>{unit.description}</p>

                  {/* Notes section */}
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <h3 className="text-sm font-semibold mb-2">Send Notes to Students</h3>
                    <Textarea
                      value={notesText[unit.id] || ''}
                      onChange={(e) => setNotesText(prev => ({ ...prev, [unit.id]: e.target.value }))}
                      placeholder="Enter notes for students..."
                      className="bg-gray-800 border-gray-700 mb-2 min-h-[80px]"
                    />
                    <Button 
                      onClick={() => handleSendNotes(unit.id, unit.code)}
                      disabled={sendingNotes[unit.id] || !notesText[unit.id]?.trim()}
                      className="w-full flex items-center justify-center gap-2 bg-[#00ffd0] hover:bg-[#00e0b8] text-black"
                    >
                      {sendingNotes[unit.id] ? (
                        <>Sending<span className="animate-pulse">...</span></>
                      ) : (
                        <>Send Notes <Send className="w-4 h-4" /></>
                      )}
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center justify-center bg-transparent border-gray-800 hover:bg-[#151515] hover:border-[#00ffd0] text-[#00ffd0] hover:text-white transition-all duration-300"
                      onClick={() => navigate(`/lecturer/units/${unit.id}/resources`)}
                    >
                      View
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent border-gray-800 hover:bg-[#151515] hover:border-yellow-500 text-yellow-500 hover:text-white transition-all duration-300"
                        onClick={() => handleEditUnit(unit)}
                      >
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent border-gray-800 hover:bg-[#151515] hover:border-red-500 text-red-500 hover:text-white transition-all duration-300"
                        onClick={() => handleDeleteUnit(unit.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Floating Add Button - only show if there are already units */}
      {units.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-24 right-6 p-4 rounded-full bg-[#00ffd0] text-black shadow-lg hover:bg-[#00e0b8] transition-colors z-50"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* Add Unit Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] rounded-xl p-6 w-full max-w-md relative border border-gray-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add New Course</h2>
              <Button
                variant="ghost"
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
                disabled={loading}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Course Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUnit.code}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  placeholder="e.g., CS101"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUnit.title}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  placeholder="e.g., Introduction to Programming"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description (Optional)</label>
                <textarea
                  value={newUnit.description}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  placeholder="Brief description of the course"
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Color Theme</label>
                <div className="flex gap-2 mt-1">
                  {['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewUnit(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-all ${
                        color === 'bg-blue-500' ? 'bg-[#0062ff]' :
                        color === 'bg-purple-500' ? 'bg-[#8b5cf6]' :
                        color === 'bg-green-500' ? 'bg-[#00ffd0]' :
                        'bg-[#ffcb6b]'
                      } ${newUnit.color === color ? 'ring-2 ring-white scale-110' : ''}`}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  disabled={loading}
                  className="flex-1 border-gray-700"
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleAddUnit}
                  disabled={loading || !newUnit.code.trim() || !newUnit.title.trim()}
                  className="flex-1 bg-[#00ffd0] hover:bg-[#00e0b8] text-black py-2 rounded-lg transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                      Adding...
                    </span>
                  ) : (
                    "Add Course"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Unit Modal */}
      {isEditing && editingUnit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] rounded-xl p-6 w-full max-w-md relative border border-gray-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Course</h2>
              <Button
                variant="ghost"
                onClick={cancelEdit}
                className="p-2 hover:bg-gray-800 rounded-lg"
                disabled={loading}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={editingUnit.code}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  readOnly
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingUnit.title}
                  onChange={(e) => setEditingUnit({...editingUnit, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  placeholder="e.g., Introduction to Programming"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={editingUnit.description}
                  onChange={(e) => setEditingUnit({...editingUnit, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  placeholder="Enter a description for the course"
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Schedule</label>
                <input
                  type="text"
                  value={editingUnit.schedule}
                  onChange={(e) => setEditingUnit({...editingUnit, schedule: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  placeholder="e.g., Monday 10:00 AM"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingUnit.progress}
                  onChange={(e) => setEditingUnit({...editingUnit, progress: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Color</label>
                <select
                  value={editingUnit.color}
                  onChange={(e) => setEditingUnit({...editingUnit, color: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  disabled={loading}
                >
                  <option value="bg-blue-500">Blue</option>
                  <option value="bg-green-500">Green</option>
                  <option value="bg-purple-500">Purple</option>
                  <option value="bg-red-500">Red</option>
                  <option value="bg-yellow-500">Yellow</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingUnit.imageUrl}
                  onChange={(e) => setEditingUnit({...editingUnit, imageUrl: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-[#00ffd0] focus:ring-1 focus:ring-[#00ffd0]"
                  placeholder="Enter image URL"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
                  onClick={cancelEdit}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#00ffd0] hover:bg-[#00e0b8] text-black"
                  onClick={handleUpdateUnit}
                  disabled={loading || !editingUnit.title}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LecturerUnits; 