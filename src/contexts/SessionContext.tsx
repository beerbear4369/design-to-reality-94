import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { getAIResponse } from "@/services/mock/ai-responses";

// Define message types
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

// Define the context value interface
interface SessionContextValue {
  sessionId: string | null;
  messages: Message[];
  status: SessionStatus;
  error: string | null;
  // Actions
  startSession: () => Promise<string>;
  sendMessage: (text: string, audioBlob?: Blob) => Promise<void>;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Initialize or restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Only attempt to restore if we don't have a session yet
        if (sessionId) return;
        
        // Try to get the session ID from URL or localStorage
        const urlSessionId = window.location.pathname.split('/session/')[1]?.split('/')[0];
        
        if (urlSessionId) {
          // If session ID is in URL, restore that session
          const restored = await getSessionById(urlSessionId);
          if (restored) {
            setSessionId(urlSessionId);
            setMessages(restored.messages || []);
            setStatus("idle");
            console.log(`Restored session with ID: ${urlSessionId}`);
          } else {
            // Session not found, create a new one
            await startNewSession();
          }
        } else {
          // Check localStorage for active session
          const activeSessionId = localStorage.getItem("activeSessionId");
          if (activeSessionId) {
            const restored = await getSessionById(activeSessionId);
            if (restored) {
              setSessionId(activeSessionId);
              setMessages(restored.messages || []);
              setStatus("idle");
              console.log(`Restored active session with ID: ${activeSessionId}`);
            } else {
              // Session not found, create a new one
              await startNewSession();
            }
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

  // Persist messages whenever they change
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      persistSession(sessionId, messages);
    }
  }, [sessionId, messages]);

  // Helper to get a session by ID from storage
  const getSessionById = async (id: string) => {
    try {
      const sessionData = localStorage.getItem(`session_${id}`);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (err) {
      console.error("Error getting session:", err);
      return null;
    }
  };

  // Helper to persist session to storage
  const persistSession = async (id: string, sessionMessages: Message[]) => {
    try {
      localStorage.setItem(`session_${id}`, JSON.stringify({
        id,
        messages: sessionMessages,
        lastUpdated: new Date().toISOString()
      }));
      localStorage.setItem("activeSessionId", id);
    } catch (err) {
      console.error("Error persisting session:", err);
    }
  };

  // Start a new session
  const startNewSession = async (): Promise<string> => {
    // Generate a new session ID
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    
    // Clear existing messages
    setMessages([]);
    
    // Reset status
    setStatus("idle");
    setError(null);
    
    // Add initial AI message
    const initialMessage: Message = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sender: "ai",
      text: "I'm here to help you with your goals. What would you like to discuss today?"
    };
    
    setMessages([initialMessage]);
    
    // Persist new session
    await persistSession(newSessionId, [initialMessage]);
    
    console.log("Created new session with ID:", newSessionId);
    return newSessionId;
  };

  // Send a message within the current session
  const sendMessage = async (text: string, audioBlob?: Blob): Promise<void> => {
    if (!sessionId) {
      throw new Error("No active session");
    }
    
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sender: "user",
      text
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Set status to processing (thinking)
    setStatus("processing");
    
    try {
      // In a real implementation, this would send the audio to the backend
      // Here we'll use our mock AI response service
      const aiResponse = await getAIResponse(text);
      
      // Add AI response with audio URL
      const aiMessage: Message = {
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sender: "ai",
        text: aiResponse.text,
        audioUrl: aiResponse.audioUrl
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setStatus("responding");
      
      // After response is displayed and audio finished, return to idle
      // In a real implementation, this would be handled by an audio onended event
      setTimeout(() => {
        setStatus("idle");
      }, 10000); // Longer timeout to account for audio playback
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      setStatus("error");
    }
  };

  // End the current session
  const endSession = async (): Promise<void> => {
    if (!sessionId) {
      return;
    }
    
    try {
      // In a real implementation, this would call the backend
      // For now, we'll just update the local state
      
      // Generate a simple summary message
      const summaryMessage: Message = {
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sender: "ai",
        text: "Thank you for your time today. I hope our conversation was helpful."
      };
      
      setMessages(prev => [...prev, summaryMessage]);
      
      // Mark session as complete in localStorage
      localStorage.setItem(`session_${sessionId}`, JSON.stringify({
        id: sessionId,
        messages,
        lastUpdated: new Date().toISOString(),
        completed: true
      }));
      
      // Clear active session
      localStorage.removeItem("activeSessionId");
      
      // Reset state for a new session
      setSessionId(null);
    } catch (err) {
      console.error("Error ending session:", err);
      setError("Failed to end session. Please try again.");
    }
  };

  // Create the context value
  const value: SessionContextValue = {
    sessionId,
    messages,
    status,
    error,
    startSession: startNewSession,
    sendMessage,
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