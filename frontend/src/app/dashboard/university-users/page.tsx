import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UniversityUsers } from "@/components/UniversityUsers";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function UniversityUsersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // If user is loaded and doesn't have a university, show error after a delay
    if (!loading && user && !user.university_id) {
      const timer = setTimeout(() => setShowError(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.university_id) {
    if (showError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">No University Found</h1>
          <p className="text-muted-foreground mb-6">
            You need to be associated with a university to view university users.
          </p>
          <Button onClick={() => navigate("/")}>Go to Homepage</Button>
        </div>
      );
    }
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">University Users</h1>
      </div>
      
      <UniversityUsers 
        universityId={user.university_id} 
        universityName={user.university_name || "Your University"} 
      />
    </div>
  );
} 