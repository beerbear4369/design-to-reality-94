import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { KukuCoach } from "@/components/kuku-coach";
import { useSession } from "@/contexts/SessionContext";

export default function ActiveSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionId: contextSessionId, startSession } = useSession();
  const [syncAttempted, setSyncAttempted] = React.useState(false);
  
  // Sync URL sessionId with context only once on mount
  React.useEffect(() => {
    // Skip if we've already attempted synchronization
    if (syncAttempted) return;
    
    const syncSession = async () => {
      try {
        if (!sessionId) {
          // If no sessionId in URL, start a new session
          const newSessionId = await startSession();
          navigate(`/session/${newSessionId}`, { replace: true });
        } else if (sessionId !== contextSessionId && !contextSessionId) {
          // Only log once and only if we need to create a new session
          console.log(`Active session with ID: ${sessionId}`);
          
          // Start a new session with the ID from the URL
          await startSession();
        }
        
        // Mark synchronization as attempted
        setSyncAttempted(true);
      } catch (error) {
        console.error("Error syncing session:", error);
      }
    };
    
    syncSession();
  }, [sessionId, contextSessionId, startSession, navigate, syncAttempted]);
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <KukuCoach />
    </div>
  );
} 