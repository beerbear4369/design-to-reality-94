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
    <div className="min-h-screen bg-black flex items-start md:items-center justify-start md:justify-center p-4">
      <div className="max-w-md w-full flex flex-col items-start mt-24 md:mt-0 md:ml-16 space-y-6">
        <h1 className="text-4xl font-bold text-white">Think Clear</h1>
        <p className="text-xl text-gray-300">Your AI Coaching Assistant</p>
        
        <Button 
          onClick={handleStartSession} 
          size="lg" 
          className="mt-12 py-6 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? "Starting..." : "Start Session"}
        </Button>
      </div>
    </div>
  );
} 