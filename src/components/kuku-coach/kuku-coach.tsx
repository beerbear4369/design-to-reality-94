import * as React from "react";
import { AIMessage } from "./ai-message";
import { RecordingButton } from "./recording-button";
import { VoiceVisualization } from "./voice-visualization";
import { ThinkingIndicator } from "./thinking-indicator";
import { useAudioLevel } from "@/hooks/use-audio-level";
import { useSession, SessionStatus } from "@/contexts/SessionContext";
import { revokeAllAudioUrls } from "@/services/audio-generator";
import { useConversation } from "@/hooks/useConversation";

export function KukuCoach() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isAISpeaking, setIsAISpeaking] = React.useState(false);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);
  
  // Use our conversation hook
  const { 
    messages, 
    status: sessionStatus, 
    error: sessionError,
    setStatus: setSessionStatus,
    setError: setSessionError,
    isProcessingAudio,
    sendAudioData
  } = useConversation();
  
  // Microphone audio level hook - activated during recording
  const { 
    audioLevel: micAudioLevel, 
    frequencyData: micFrequencyData, 
    error: audioLevelError 
  } = useAudioLevel({ isRecording });

  // AI audio level hook - connected to the audio player element
  const {
    audioLevel: aiAudioLevel,
    frequencyData: aiFrequencyData,
    error: aiAudioError
  } = useAudioLevel({ audioElement: audioPlayerRef.current });

  // Combined error state
  const error = audioLevelError || sessionError || aiAudioError;

  // Latest message for display
  const latestMessage = React.useMemo(() => {
    if (messages.length === 0) {
      return "I'm here to help you with your goals.\nWhat would you like to discuss today?";
    }
    return messages[messages.length - 1].text;
  }, [messages]);

  // Track when recording state changes
  const handleRecordingStateChange = React.useCallback((recording: boolean) => {
    console.log(`Recording state changed to: ${recording}`);
    setIsRecording(recording);
  }, []);

  // Play audio when a new AI message is received
  React.useEffect(() => {
    // Only play audio if the session is in the responding state
    if (sessionStatus === "responding" && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      // Only play audio for AI messages with an audioUrl
      if (latestMessage.sender === "ai" && latestMessage.audioUrl) {
        console.log(`Playing AI response audio from URL: ${latestMessage.audioUrl}`);
        
        // Create audio element if it doesn't exist
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio();
        }
        
        // Configure audio element
        const audioEl = audioPlayerRef.current;
        
        audioEl.onended = () => {
          console.log("Audio playback finished");
          setIsAISpeaking(false);
          setSessionStatus("idle");
        };
        
        audioEl.onerror = (e) => {
          console.error("Audio playback error:", e);
          setIsAISpeaking(false);
          setSessionError("Could not play audio response");
          setSessionStatus("error");
        };
        
        // Stop any currently playing audio
        if (!audioEl.paused) {
          audioEl.pause();
          audioEl.currentTime = 0;
        }
        
        // Set the source and load it
        audioEl.src = latestMessage.audioUrl;
        audioEl.load();
        
        // Add a small delay before playing to ensure everything is ready
        setTimeout(() => {
          // Play audio with simple retry
          const playPromise = audioEl.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Audio playback started successfully");
                setIsAISpeaking(true);
              })
              .catch(err => {
                console.error("Could not play audio:", err);
                setIsAISpeaking(false);
                // If audio fails, still move to idle state
                setSessionStatus("idle");
              });
          } else {
            // Older browsers might not return a promise
            setIsAISpeaking(true);
          }
        }, 300); // Increased delay to give more time for loading
      } else {
        console.warn("AI message without audio URL:", latestMessage);
        // If no audio URL, just move to idle
        setTimeout(() => setSessionStatus("idle"), 2000);
      }
    } else if (sessionStatus !== "responding") {
      // Ensure AI speaking is off when not in responding state
      setIsAISpeaking(false);
      
      // Stop any playing audio when state changes
      if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
    }
    
    // Cleanup function to handle component unmount or state changes
    return () => {
      if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
    };
  }, [messages, sessionStatus, setSessionStatus, setSessionError]);

  // Determine message display text based on state
  const getMessageText = () => {
    if (error) {
      return error;
    }
    
    switch (sessionStatus) {
      case "recording":
        return "I'm listening...";
      case "idle":
      case "responding":
        return latestMessage;
      case "processing":
        return "Thinking...";
      case "error":
        return "Sorry, something went wrong. Please try again.";
      default:
        return latestMessage;
    }
  };

  // Determine if we should show typing animation
  const shouldShowTypingAnimation = sessionStatus === "responding";

  // Cleanup logic to revoke audio URLs when the component unmounts
  React.useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      revokeAllAudioUrls();
    };
  }, []);

  // Debug current state
  React.useEffect(() => {
    // console.log(`Audio visualization: recording=${isRecording}, speaking=${isAISpeaking}, audioLevel=${isRecording ? micAudioLevel : aiAudioLevel}`);
  }, [sessionStatus, isRecording, isAISpeaking, micAudioLevel, aiAudioLevel]);

  return (
    <main className="bg-black flex max-w-[400px] w-full flex-col overflow-hidden items-center mx-auto py-[40px] min-h-screen">
      <header className="text-white text-[28px] font-semibold tracking-wide">
        Kuku Coach
      </header>
      
      <section className="flex flex-col items-center justify-between w-full flex-1">
        <h2 className="text-white text-lg font-normal mt-[32px] opacity-90">
          Speak to your coach
        </h2>
        
        {/* Voice visualization */}
        <div className="w-full flex justify-center mt-[30px]">
          <div className="w-[300px] h-[300px] relative">
            <VoiceVisualization 
              isRecording={isRecording || isAISpeaking} 
              audioLevel={isRecording ? micAudioLevel : aiAudioLevel}
              frequencyData={isRecording ? micFrequencyData : aiFrequencyData}
            />
          </div>
        </div>
        
        {/* Thinking indicator */}
        <ThinkingIndicator isThinking={sessionStatus === "processing"} />
        
        {/* Message container */}
        <div className="min-h-[100px] flex items-center justify-center w-full px-6 mt-[20px]">
          <AIMessage 
            message={getMessageText()}
            isTyping={shouldShowTypingAnimation}
          />
        </div>
        
        {/* Recording button */}
        <div className="mb-[50px] mt-[20px]">
          <RecordingButton onRecordingChange={handleRecordingStateChange} />
        </div>
      </section>
    </main>
  );
}
