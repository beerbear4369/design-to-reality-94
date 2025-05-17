import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";

export default function SessionSummaryPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = React.useState<number>(0);
  const { messages, startSession } = useSession();
  
  // Generate a simple summary from messages
  const summary = React.useMemo(() => {
    // Default summary if no messages
    if (!messages || messages.length === 0) {
      return "You had a coaching session with Kuku Coach.";
    }
    
    // Get AI messages (excluding the first greeting)
    const aiMessages = messages.filter((msg, index) => 
      msg.sender === "ai" && index > 0
    );
    
    // If we have AI messages, use the last one as a summary
    if (aiMessages.length > 0) {
      return aiMessages[aiMessages.length - 1].text;
    }
    
    return "Today's coaching session focused on improving communication skills and setting clear goals.";
  }, [messages]);
  
  const handleStartNewSession = async () => {
    try {
      // Start a new session
      const newSessionId = await startSession();
      
      // Navigate to the new session
      navigate(`/session/${newSessionId}`);
    } catch (error) {
      console.error("Failed to start new session:", error);
    }
  };
  
  const handleViewHistory = () => {
    // Placeholder for viewing session history
    console.log("View history functionality will be implemented in a later phase");
  };
  
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center p-4">
      <div className="max-w-md w-full flex flex-col items-center space-y-8 pt-8">
        <h1 className="text-2xl font-bold text-white/90">Session Summary</h1>
        
        <div className="bg-[#080722] border border-white/10 rounded-[20px] p-6 w-full">
          <p className="text-white/70 text-base mb-6">
            {summary}
          </p>
          
          <div className="mt-8 mb-4 text-center">
            <p className="text-white/70 text-sm mb-4">How was your coaching experience?</p>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-3xl focus:outline-none"
                >
                  <span className={`${rating >= star ? 'text-yellow-400' : 'text-white/30'}`}>
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4 w-full mt-4">
          <Button 
            onClick={handleStartNewSession} 
            size="lg" 
            className="w-full bg-[#312CA3] hover:bg-[#413DB3] text-white/90 font-semibold py-4 rounded-xl"
          >
            Start New Session
          </Button>
          
          <Button 
            onClick={handleViewHistory} 
            variant="outline"
            size="lg"
            className="w-full bg-[#080722] border-white/10 text-white/90 hover:bg-[#121035] font-semibold py-4 rounded-xl"
          >
            View Session History
          </Button>
        </div>
      </div>
    </div>
  );
} 