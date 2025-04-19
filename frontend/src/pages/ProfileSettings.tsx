import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  User as UserIcon, 
  Building2, 
  BookOpen, 
  History, 
  MessageSquare,
  AlertTriangle,
  FileText
} from 'lucide-react';

const ProfileSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [course, setCourse] = useState(user?.course || '');
  const [bio, setBio] = useState(user?.bio || '');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setUniversity(user.university || '');
      setDepartment(user.department || '');
      setCourse(user.course || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        name,
        email,
        phone,
        university,
        department,
        course,
        bio,
      });
      toast({
        title: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile.",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white pb-20">
        <Header />
        <div className="p-4 max-w-7xl mx-auto">
          <Toaster />
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Profile Settings</h1>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm sm:text-base">Name</Label>
                  <input
                    type="text"
                    id="name"
                    className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm sm:text-base">Phone</Label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university" className="text-sm sm:text-base">University</Label>
                  <input
                    type="text"
                    id="university"
                    className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm sm:text-base">Department</Label>
                  <input
                    type="text"
                    id="department"
                    className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course" className="text-sm sm:text-base">Course</Label>
                  <input
                    type="text"
                    id="course"
                    className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm sm:text-base">Bio</Label>
                <textarea
                  id="bio"
                  className="w-full p-2 sm:p-3 border rounded min-h-[100px] text-sm sm:text-base"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded text-sm sm:text-base font-medium hover:bg-blue-600 transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSettings;
