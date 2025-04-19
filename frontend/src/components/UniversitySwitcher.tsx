
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, School } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { University } from '@/data/universities';

interface UniversitySwitcherProps {
  className?: string;
  university?: University;
  selected?: boolean;
  onClick?: () => void;
}

const UniversitySwitcher: React.FC<UniversitySwitcherProps> = ({ 
  className = "", 
  university,
  selected,
  onClick
}) => {
  const { user, switchActiveUniversity } = useAuth();
  const navigate = useNavigate();

  // If a specific university is provided, render just that card
  if (university) {
    return (
      <Card 
        key={university.id} 
        className={`group cursor-pointer transition-all duration-300 hover:shadow-lg 
          ${selected ? 'border-2 border-blue-500 bg-blue-900/10' : 'bg-card hover:bg-card/90'}`}
        onClick={onClick}
      >
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center flex-shrink-0">
            <School className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{university.name}</p>
            <p className="text-sm text-muted-foreground">{university.department}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </CardContent>
      </Card>
    );
  }

  // Return null if no user or user has no universities
  if (!user || !user.universities || user.universities.length === 0) {
    return null;
  }

  const handleUniversityClick = async (universityId: string) => {
    try {
      await switchActiveUniversity(universityId);
      // Optionally, you could navigate to a specific route for that university
      // navigate(`/lecturer/universities/${universityId}/dashboard`);
    } catch (error) {
      console.error("Failed to switch university", error);
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      <h2 className="text-lg font-medium mb-4">Your Universities</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {user.universities.map((university) => (
          <Card 
            key={university.id} 
            className={`group cursor-pointer transition-all duration-300 hover:shadow-lg 
              ${user.university_id === university.id ? 'border-2 border-blue-500 bg-blue-900/10' : 'bg-card hover:bg-card/90'}`}
            onClick={() => handleUniversityClick(university.id)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <School className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{university.name}</p>
                <p className="text-sm text-muted-foreground">{university.department}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UniversitySwitcher;
