import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SessionSummaryPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const handleStartNewSession = () => {
    navigate('/');
  };
  
  const handleViewHistory = () => {
    // Placeholder for viewing session history
    console.log("View history functionality will be implemented in a later phase");
  };
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full flex flex-col items-center space-y-8">
        <h1 className="text-3xl font-bold text-white">Session Summary</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 w-full">
          <p className="text-white">Session Summary (ID: {sessionId})</p>
          <p className="text-gray-300 mt-2">This is a placeholder for the session summary screen, which will display a summary of the coaching session and allow rating the experience.</p>
        </div>
        
        <div className="flex flex-col space-y-4 w-full max-w-xs mt-6">
          <Button 
            onClick={handleStartNewSession} 
            size="lg" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Start New Session
          </Button>
          
          <Button 
            onClick={handleViewHistory} 
            size="lg" 
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            View Session History
          </Button>
        </div>
      </div>
    </div>
  );
} 