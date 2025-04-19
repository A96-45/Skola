import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-center opacity-10"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center space-y-6 sm:space-y-8">
          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-24 h-24 sm:w-32 sm:h-32 mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-center w-full h-full">
                <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
            </motion.div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              404
            </h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-white/90">
              Page Not Found
            </h2>
            <p className="text-sm sm:text-base text-white/70 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6">
            <Button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base 
                py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg transition-all duration-300 flex items-center 
                justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-purple-600 
                hover:from-violet-600 hover:to-purple-700 text-white text-sm sm:text-base 
                py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg transition-all duration-300 flex items-center 
                justify-center gap-2"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              Go Home
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-48 h-48 sm:w-72 sm:h-72 bg-blue-500/20 rounded-full 
          -top-12 -left-12 sm:-top-24 sm:-left-24 blur-3xl animate-pulse" />
        <div className="absolute w-48 h-48 sm:w-72 sm:h-72 bg-violet-500/20 rounded-full 
          bottom-0 right-0 sm:bottom-12 sm:right-12 blur-3xl animate-pulse delay-1000" />
      </div>
    </div>
  );
};

export default NotFound;
