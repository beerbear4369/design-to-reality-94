import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { createSession } from "@/services/api/session";

// Define message types (kept for reference by consumers)
export interface Message {
  id: string;
  timestamp: string;
  sender: "user" | "ai";
  text: string;
  audioUrl?: string;
}

// Define session states
export type SessionStatus = 
  | "idle"       // Ready for user input
  | "recording"  // Capturing user audio
  | "processing" // "Thinking" state
  | "responding" // Displaying/playing AI response
  | "error";     // Error state

// Define the context value interface - simplified to focus on session state only
interface SessionContextValue {
  sessionId: string | null;
  status: SessionStatus;
  error: string | null;
  // Actions
  startSession: (sessionId?: string) => Promise<string>;
  endSession: () => Promise<void>;
  // State helpers
  setStatus: (status: SessionStatus) => void;
  setError: (error: string | null) => void;
}

// Create the context with a default value
const SessionContext = createContext<SessionContextValue | undefined>(undefined);

// Session provider props
interface SessionProviderProps {
  children: React.ReactNode;
}

// Create the SessionProvider component
export function SessionProvider({ children }: SessionProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Initialize or restore session ID on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Only attempt to restore if we don't have a session yet
        if (sessionId) return;
        
        // Try to get the session ID from URL
        const urlSessionId = window.location.pathname.split('/session/')[1]?.split('/')[0];
        
        if (urlSessionId) {
          // If session ID is in URL, restore that session
          setSessionId(urlSessionId);
          setStatus("idle");
          console.log(`Restored session ID from URL: ${urlSessionId}`);
        }
        // Note: We removed localStorage session restoration since sessions should be created fresh
      } catch (err) {
        console.error("Error restoring session:", err);
        setError("Failed to restore session.");
      }
    };

    // Only try to restore session once on mount
    restoreSession();
  }, []); // Empty dependency array to run only once on mount

  // Start a new session - FIXED: Now calls backend API first
  const startNewSession = async (providedSessionId?: string): Promise<string> => {
    try {
      console.log(`SessionContext: Creating session with real backend API`);
      
      // Call the real backend API to create a session
      const response = await createSession(providedSessionId);
      const realSessionId = response.sessionId;
      
      console.log(`SessionContext: Backend created session: ${realSessionId}`);
      
      // Update state with the real session ID from backend
      setSessionId(realSessionId);
      setStatus("idle");
      setError(null);
      
      // Store the session ID (optional, for restore purposes)
      localStorage.setItem("activeSessionId", realSessionId);
      
      console.log("SessionContext: Session started successfully with real ID:", realSessionId);
      return realSessionId;
    } catch (err) {
      console.error("SessionContext: Failed to create session with backend:", err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      throw err; // Re-throw so the UI can handle the error
    }
  };

  // End the current session
  const endSession = async (): Promise<void> => {
    if (!sessionId) {
      return;
    }
    
    try {
      // Clear active session
      localStorage.removeItem("activeSessionId");
      
      // Reset state for a new session
      setSessionId(null);
      setStatus("idle");
    } catch (err) {
      console.error("Error ending session:", err);
      setError("Failed to end session. Please try again.");
    }
  };

  // Create the context value
  const value: SessionContextValue = {
    sessionId,
    status,
    error,
    startSession: startNewSession,
    endSession,
    setStatus,
    setError
  };

  // Provide the context value to children
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// Custom hook for using the session context
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
} 