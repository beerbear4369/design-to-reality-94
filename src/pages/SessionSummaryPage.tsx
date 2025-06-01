import * as React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";

interface LocationState {
  autoEnded?: boolean;
  finalSummary?: string;
  lastMessage?: string;
}

interface SummarySection {
  title: string;
  content: string[];
}

export default function SessionSummaryPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [rating, setRating] = React.useState<number>(0);
  const { startSession } = useSession();
  
  // Get navigation state for auto-ended sessions
  const locationState = location.state as LocationState | null;
  
  // Parse and format the summary into sections
  const parsedSummary = React.useMemo(() => {
    // First priority: Backend-provided final summary
    if (locationState?.finalSummary) {
      console.log('📝 Using backend-provided final summary');
      return parseBackendSummary(locationState.finalSummary);
    }
    
    // Second priority: Last AI message for auto-ended sessions
    if (locationState?.autoEnded && locationState?.lastMessage) {
      console.log('📝 Using last AI message for auto-ended session');
      return parseBackendSummary(locationState.lastMessage);
    }
    
    // Fallback: Default summary message
    console.log('📝 Using default summary message');
    return {
      isStructured: false,
      content: "Thank you for your coaching session with Kuku Coach. We hope you found it helpful and gained valuable insights.",
      sections: []
    };
  }, [locationState]);

  // Function to parse backend summary into structured sections
  function parseBackendSummary(summary: string) {
    const lines = summary.split('\n').filter(line => line.trim() !== '');
    const sections: SummarySection[] = [];
    let currentSection: SummarySection | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this line is a section header (contains colons and is in CAPS or has specific patterns)
      if (trimmedLine.includes(':') && (
        trimmedLine.match(/^[A-Z\s]+:/) || 
        trimmedLine.includes('KEY DISCUSSION POINTS') ||
        trimmedLine.includes('MAIN BREAKTHROUGHS') ||
        trimmedLine.includes('ACTION PLAN')
      )) {
        // Save previous section if exists
        if (currentSection && currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        
        // Start new section
        const colonIndex = trimmedLine.indexOf(':');
        currentSection = {
          title: trimmedLine.substring(0, colonIndex).trim(),
          content: []
        };
        
        // Add content after colon if exists
        const contentAfterColon = trimmedLine.substring(colonIndex + 1).trim();
        if (contentAfterColon) {
          currentSection.content.push(contentAfterColon);
        }
      } else if (currentSection && trimmedLine) {
        // Add content to current section
        currentSection.content.push(trimmedLine);
      }
    }
    
    // Add final section
    if (currentSection && currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    
    return {
      isStructured: sections.length > 0,
      content: summary,
      sections: sections
    };
  }
  
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
  
  // Show session type indicator for debugging/development
  const sessionTypeIndicator = locationState?.autoEnded ? 
    "🤖 Automatically ended by AI" : 
    "👤 Manually ended";
  
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center p-4">
      <div className="max-w-2xl w-full flex flex-col items-center space-y-8 pt-8">
        <h1 className="text-2xl font-bold text-white/90">Session Summary</h1>
        
        {/* Development indicator - can be removed in production */}
        {process.env.NODE_ENV === 'development' && (
          <p className="text-white/50 text-xs">{sessionTypeIndicator}</p>
        )}
        
        <div className="bg-[#080722] border border-white/10 rounded-[20px] p-6 w-full">
          {parsedSummary.isStructured ? (
            <div className="space-y-6">
              {parsedSummary.sections.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-white/90 font-semibold text-lg border-b border-white/20 pb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.content.map((item, itemIndex) => (
                      <p key={itemIndex} className="text-white/70 text-base leading-relaxed">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/70 text-base leading-relaxed">
              {parsedSummary.content}
            </p>
          )}
          
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