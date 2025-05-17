import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";

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
        
        // Try to get the session ID from URL or localStorage
        const urlSessionId = window.location.pathname.split('/session/')[1]?.split('/')[0];
        
        if (urlSessionId) {
          // If session ID is in URL, restore that session
          setSessionId(urlSessionId);
          setStatus("idle");
          console.log(`Restored session ID from URL: ${urlSessionId}`);
        } else {
          // Check localStorage for active session
          const activeSessionId = localStorage.getItem("activeSessionId");
          if (activeSessionId) {
            setSessionId(activeSessionId);
            setStatus("idle");
            console.log(`Restored active session ID: ${activeSessionId}`);
          } else {
            // No active session, create a new one
            await startNewSession();
          }
        }
      } catch (err) {
        console.error("Error restoring session:", err);
        setError("Failed to restore session. Starting a new one.");
        await startNewSession();
      }
    };

    // Only try to restore session once on mount
    restoreSession();
  }, []); // Empty dependency array to run only once on mount

  // Start a new session
  const startNewSession = async (providedSessionId?: string): Promise<string> => {
    // Use provided session ID or generate a new one with format matching the API
    const newSessionId = providedSessionId || 
      `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    console.log(`SessionContext: Starting new session with ID: ${newSessionId}`);
    
    setSessionId(newSessionId);
    
    // Reset state
    setStatus("idle");
    setError(null);
    
    // Store the session ID
    localStorage.setItem("activeSessionId", newSessionId);
    
    console.log("Created new session with ID:", newSessionId);
    return newSessionId;
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