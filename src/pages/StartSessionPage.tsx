import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";

export default function StartSessionPage() {
  const navigate = useNavigate();
  const { startSession } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleStartSession = async () => {
    try {
      setIsLoading(true);
      
      // Use the session context to start a new session
      const newSessionId = await startSession();
      
      // Navigate to the session page with the session ID
      navigate(`/session/${newSessionId}`);
    } catch (error) {
      console.error("Failed to start session:", error);
      // In a real implementation, we would display an error toast/message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* Responsive container for start session content */}
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-center p-4 sm:p-6">
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Think Clear</h1>
            <p className="text-lg sm:text-xl text-gray-300">Your AI Coaching Assistant</p>
          </div>
          
          <div className="pt-8">
            <Button 
              onClick={handleStartSession} 
              size="lg" 
              className="w-full max-w-xs py-4 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Starting...</span>
                </div>
              ) : (
                "Start Session"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 