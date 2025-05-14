import * as React from "react";
import { useParams } from "react-router-dom";
import { KukuCoach } from "@/components/kuku-coach";

export default function ActiveSessionPage() {
  const { sessionId } = useParams();
  
  // Keeping the sessionId for future use with actual API calls
  React.useEffect(() => {
    console.log(`Active session with ID: ${sessionId}`);
    // In a real implementation, we would use this sessionId with API calls
  }, [sessionId]);
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <KukuCoach />
    </div>
  );
} 