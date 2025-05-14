import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function StartSessionPage() {
  const navigate = useNavigate();

  const handleStartSession = async () => {
    try {
      // Placeholder for actual API call to start a session
      // In a real implementation, this would call the backend API
      // const response = await fetch('/api/session/start', { method: 'POST' });
      // const data = await response.json();
      
      // For now, we'll use a mock session ID
      const mockSessionId = "session-" + Date.now();
      
      // Navigate to the session page with the session ID
      navigate(`/session/${mockSessionId}`);
    } catch (error) {
      console.error("Failed to start session:", error);
      // In a real implementation, we would display an error toast/message
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-start md:items-center justify-start md:justify-center p-4">
      <div className="max-w-md w-full flex flex-col items-start mt-24 md:mt-0 md:ml-16 space-y-6">
        <h1 className="text-4xl font-bold text-white">Kuku Coach</h1>
        <p className="text-xl text-gray-300">Your AI Coaching Assistant</p>
        
        <Button 
          onClick={handleStartSession} 
          size="lg" 
          className="mt-12 py-6 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium rounded-xl"
        >
          Start Session
        </Button>
      </div>
    </div>
  );
} 