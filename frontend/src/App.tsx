import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { ThemeProvider } from "next-themes";
import Welcome from "./pages/Welcome";
import NotFound from "./pages/NotFound";
import StudentDashboard from "./pages/Student/StudentDashboard";
import LecturerDashboard from "./pages/Lecturer/LecturerDashboard";
import StudentTimetable from "./pages/Student/StudentTimetable";
import StudentCourses from "./pages/Student/StudentCourses";
import StudentCourse from "./pages/Student/StudentCourse";
import StudentCourseDetail from "./pages/Student/StudentCourseDetail";
import CourseContent from "./pages/Student/CourseContent";
import LecturerResources from "./pages/Lecturer/LecturerResources";
import LecturerClasses from "./pages/Lecturer/LecturerClasses";
import LecturerStudents from "./pages/Lecturer/LecturerStudents";
import ClassAssignments from "./pages/Lecturer/ClassAssignments";
import ClassResources from "./pages/Lecturer/ClassResources";
import StudentNotifications from "./pages/Student/StudentNotifications";
import LecturerNotifications from "./pages/Lecturer/LecturerNotifications";
import UniversityLinkDemo from './pages/UniversityLinkDemo';
import SchedulerPage from './pages/Lecturer/SchedulerPage';
import ReactDOM from 'react-dom/client';
import Attendance from './pages/Student/Attendance';
import FeePayment from './pages/Student/FeePayment';
import Assignments from './pages/Student/Assignments';
import AssignmentSubmission from './pages/Student/AssignmentSubmission';
import StudentChatbot from './pages/Student/StudentChatbot';
import StudentProfile from './pages/Student/StudentProfile';
import LecturerProfile from './pages/Lecturer/LecturerProfile';
import LecturerLayout from '@/layouts/LecturerLayout';
import StudentLayout from '@/layouts/StudentLayout';
import LecturerUnits from './pages/Lecturer/LecturerUnits';
import UnitResources from './pages/Lecturer/UnitResources';
import AssignmentGrading from './pages/Lecturer/AssignmentGrading';
import StudentPlanner from './pages/Student/StudentPlanner';
import LecturerPlanner from './pages/Lecturer/LecturerPlanner';
import UniversityUsersPage from './app/dashboard/university-users/page';
import UniversityUnits from './pages/Student/UniversityUnits';
import UnitDetail from './pages/Student/UnitDetail';

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <WebSocketProvider>
              <Routes>
                {/* Welcome Route */}
                <Route path="/" element={<Welcome />} />
                
                {/* Student Routes - Wrapped in Layout */}
                <Route element={<StudentLayout />}>
                  <Route path="/student" element={<StudentDashboard />} />
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/timetable" element={<StudentTimetable />} />
                  <Route path="/student/courses" element={<StudentCourses />} />
                  <Route path="/student/course/:id" element={<StudentCourse />} />
                  <Route path="/student/courses/:courseId" element={<StudentCourseDetail />} />
                  <Route path="/student/courses/video/:contentId" element={<CourseContent />} />
                  <Route path="/student/courses/document/:contentId" element={<CourseContent />} />
                  <Route path="/student/courses/quiz/:contentId" element={<CourseContent />} />
                  <Route path="/student/courses/assignment/:contentId" element={<CourseContent />} />
                  <Route path="/student/notifications" element={<StudentNotifications />} />
                  <Route path="/student/attendance" element={<Attendance />} />
                  <Route path="/student/fee-payment" element={<FeePayment />} />
                  <Route path="/student/assignments" element={<Assignments />} />
                  <Route path="/student/assignments/submission" element={<AssignmentSubmission />} />
                  <Route path="/student/chatbot" element={<StudentChatbot />} />
                  <Route path="/student/profile" element={<StudentProfile />} />
                  <Route path="/student/planner" element={<StudentPlanner />} />
                  <Route path="/student/university/:universityId/units" element={<UniversityUnits />} />
                  <Route path="/student/unit/:unitId" element={<UnitDetail />} />
                </Route>
                
                {/* Lecturer Routes - Wrapped in Layout */}
                <Route element={<LecturerLayout />}>
                  <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
                  <Route path="/lecturer/resources" element={<LecturerResources />} />
                  <Route path="/lecturer/students" element={<LecturerStudents />} />
                  <Route path="/lecturer/units" element={<LecturerUnits />} />
                  <Route path="/lecturer/scheduler" element={<SchedulerPage />} />
                  <Route path="/lecturer/notifications" element={<LecturerNotifications />} />
                  <Route path="/lecturer/profile" element={<LecturerProfile />} />
                  <Route path="/lecturer/classes" element={<LecturerClasses />} />
                  <Route path="/lecturer/classes/:id" element={<LecturerClasses />} />
                  <Route path="/lecturer/class/:id/assignments" element={<ClassAssignments />} />
                  <Route path="/lecturer/class/:id/resources" element={<ClassResources />} />
                  <Route path="/lecturer/planner" element={<LecturerPlanner />} />
                  
                  {/* Add nested routes for units */}
                  <Route path="/lecturer/units/:id/resources" element={<UnitResources />} />
                  <Route path="/lecturer/units/:id/students" element={<LecturerStudents />} />
                  <Route path="/lecturer/assignments/:id/grade" element={<AssignmentGrading />} />
                </Route>
                
                {/* Redirects */}
                <Route path="/dashboard/student" element={<Navigate to="/student/dashboard" replace />} />
                <Route path="/dashboard/lecturer" element={<Navigate to="/lecturer/dashboard" replace />} />
                <Route path="/dashboard/university-users" element={<UniversityUsersPage />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
                
                {/* Add the new route */}
                <Route path="/university-link-demo" element={<UniversityLinkDemo />} />
              </Routes>
            </WebSocketProvider>
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
