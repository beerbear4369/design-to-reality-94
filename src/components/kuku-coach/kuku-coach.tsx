import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AIMessage } from "./ai-message";
import { RecordingButton } from "./recording-button";
import { VoiceVisualization } from "./voice-visualization";
import { ThinkingIndicator } from "./thinking-indicator";
import { useAudioLevel } from "@/hooks/use-audio-level";
import { useSession } from "@/contexts/SessionContext";
import { sendAudio, endSession } from "@/services/api/session";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

// Simple state for the entire conversation flow
type AppState = "idle" | "recording" | "processing" | "responding" | "session-ended" | "error";

export function KukuCoach() {
  // Navigation hook for automatic session ending
  const navigate = useNavigate();
  
  // Simplified state - everything in one place
  const [appState, setAppState] = React.useState<AppState>("idle");
  const [isRecording, setIsRecording] = React.useState(false);
  const [isAISpeaking, setIsAISpeaking] = React.useState(false);
  const [currentMessage, setCurrentMessage] = React.useState("I’m here to help you think clearly and move forward. \nNot by giving advice, but by asking questions and supporting your thinking.\nWhat would you like to discuss today?");
  const [error, setError] = React.useState<string | null>(null);
  
  // End conversation dialog state
  const [isEndingSession, setIsEndingSession] = React.useState(false);
  
  // Audio player ref
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);
  
  // Session context for session ID
  const session = useSession();
  
  // Audio level hooks
  const { 
    audioLevel: micAudioLevel, 
    frequencyData: micFrequencyData 
  } = useAudioLevel({ isRecording });

  const {
    audioLevel: aiAudioLevel,
    frequencyData: aiFrequencyData,
  } = useAudioLevel({ audioElement: audioPlayerRef.current });

  // Handle ending session manually
  const handleEndSession = React.useCallback(async () => {
    if (!session.sessionId || isEndingSession) return;
    
    console.log('🛑 User manually ending session:', session.sessionId);
    setIsEndingSession(true);
    
    try {
      // Stop any ongoing audio first
      if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
      
      // Set ending state
      setAppState("session-ended");
      setCurrentMessage("Ending session...");
      setError(null);
      
      // Call backend to end session
      const response = await endSession(session.sessionId);
      
      console.log('✅ Session ended successfully:', response.summaryText);
      
      // Navigate to summary page with manual ending flag
      navigate(`/summary/${session.sessionId}`, {
        state: { 
          autoEnded: false,
          finalSummary: response.summaryText,
          lastMessage: "Session ended by user",
          manualEnd: true
        }
      });
      
    } catch (err) {
      console.error('❌ Error ending session:', err);
      setError(err instanceof Error ? err.message : "Failed to end session");
      setAppState("idle");
    } finally {
      setIsEndingSession(false);
    }
  }, [session.sessionId, navigate, isEndingSession]);

  // Handle recording state changes
  const handleRecordingStateChange = React.useCallback((recording: boolean) => {
    console.log(`🎙️ Recording state: ${recording}`);
    setIsRecording(recording);
    if (recording) {
      setAppState("recording");
      setCurrentMessage("I'm listening...");
    }
  }, []);

  // Main function: Handle audio blob when recording is complete
  const handleAudioComplete = React.useCallback(async (audioBlob: Blob) => {
    if (!audioBlob) {
      console.error("No audio blob received");
      return;
    }

    if (!session.sessionId) {
      console.error("No session ID available");
      setError("No active session. Please refresh the page.");
      setAppState("error");
      return;
    }

    console.log(`🔄 Processing audio blob: ${audioBlob.size} bytes`);
    
    try {
      // Step 1: Set processing state
      setAppState("processing");
      setCurrentMessage("Thinking...");
      setError(null);

      // Step 2: Send audio to backend
      console.log(`📤 Sending audio to backend for session: ${session.sessionId}`);
      const response = await sendAudio(session.sessionId, audioBlob);
      
      console.log(`✅ Received response:`, {
        messageId: response.messageId,
        text: response.text,
        audioUrl: response.audioUrl,
        sessionEnded: response.sessionEnded,
        hasFinalSummary: !!response.finalSummary
      });

      // Step 3: Check for automatic session ending
      if (response.sessionEnded) {
        console.log('🏁 Session automatically ended by backend');
        setAppState("session-ended");
        setCurrentMessage(response.finalSummary || "Thank you for your session. Here's your summary.");
        
        // Navigate to summary page after a brief delay to show the ending message
        setTimeout(() => {
          console.log('🔄 Navigating to summary page...');
          navigate(`/summary/${session.sessionId}`, {
            state: { 
              autoEnded: true,
              finalSummary: response.finalSummary,
              lastMessage: response.text
            }
          });
        }, 3000); // 3 second delay to let user see the ending message
        
        return; // Don't proceed with normal audio playback flow
      }

      // Step 4: Normal flow - Display AI response text
      setAppState("responding");
      setCurrentMessage(response.text);

      // Step 5: Play AI audio if available
      if (response.audioUrl) {
        setTimeout(() => {
          playAIAudio(response.audioUrl!);
        }, 500); // Small delay to let text animation start
      } else {
        // No audio, just finish
        setTimeout(() => {
          setAppState("idle");
        }, 2000);
      }

    } catch (err) {
      console.error("❌ Error processing audio:", err);
      setError(err instanceof Error ? err.message : "Failed to process audio");
      setAppState("error");
      setCurrentMessage("Sorry, something went wrong. Please try again.");
    }
  }, [session.sessionId, navigate]);

  // Play AI audio response
  const playAIAudio = React.useCallback((audioUrl: string) => {
    console.log(`🔊 Playing AI audio: ${audioUrl}`);
    
    // Create audio element if needed
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio();
      // Set audio properties for better compatibility
      audioPlayerRef.current.preload = 'auto';
      audioPlayerRef.current.volume = 0.8; // Set volume to 80%
      // CORS FIX: Allow cross-origin access for audio visualization
      audioPlayerRef.current.crossOrigin = 'anonymous';
      console.log("🔊 Audio element created with CORS support");
    }

    const audioEl = audioPlayerRef.current;

    // Set up event handlers
    audioEl.onloadstart = () => {
      console.log("🔊 Audio loading started");
    };

    audioEl.oncanplay = () => {
      console.log("🔊 Audio can start playing");
    };

    audioEl.onended = () => {
      console.log("🔊 Audio playback finished");
      setIsAISpeaking(false);
      setAppState("idle");
    };

    audioEl.onerror = (e) => {
      console.error("🔊 Audio playback error:", e);
      console.error("🔊 Audio error details:", {
        src: audioEl.src,
        error: audioEl.error,
        networkState: audioEl.networkState,
        readyState: audioEl.readyState
      });
      setIsAISpeaking(false);
      setAppState("idle");
      setError("Could not play audio response");
    };

    // Stop any currently playing audio
    if (!audioEl.paused) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }

    // Set the source and load it
    audioEl.src = audioUrl;
    console.log(`🔊 Loading audio from: ${audioUrl}`);
    
    // Force load the audio
    audioEl.load();
    
    // Wait for the audio to be ready, then play
    const attemptPlay = () => {
      console.log(`🔊 Attempting to play audio, readyState: ${audioEl.readyState}`);
      
      const playPromise = audioEl.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("🔊 ✅ Audio playback started successfully");
            setIsAISpeaking(true);
          })
          .catch(err => {
            console.error("🔊 ❌ Failed to play audio:", err);
            console.error("🔊 Play error details:", {
              name: err.name,
              message: err.message,
              audioSrc: audioEl.src,
              volume: audioEl.volume,
              muted: audioEl.muted
            });
            
            // Try to recover from autoplay policy issues
            if (err.name === 'NotAllowedError') {
              console.log("🔊 Autoplay blocked - will try to play on next user interaction");
              setError("Click anywhere to enable audio playback");
            }
            
            setAppState("idle");
          });
      } else {
        // Older browsers might not return a promise
        console.log("🔊 Audio playback started (legacy browser)");
        setIsAISpeaking(true);
      }
    };

    // Try to play immediately, or wait for canplay event
    if (audioEl.readyState >= 3) { // HAVE_FUTURE_DATA
      attemptPlay();
    } else {
      console.log("🔊 Waiting for audio to load...");
      audioEl.oncanplay = () => {
        console.log("🔊 Audio ready, attempting play");
        attemptPlay();
      };
    }
  }, []);

  // Handle click to enable audio (needed for browser autoplay policies)
  const handleEnableAudio = React.useCallback(() => {
    if (audioPlayerRef.current && audioPlayerRef.current.paused && isAISpeaking) {
      console.log("🔊 User interaction - attempting to play paused audio");
      audioPlayerRef.current.play()
        .then(() => {
          console.log("🔊 Audio resumed after user interaction");
          setError(null);
        })
        .catch(err => {
          console.error("🔊 Still failed to play after user interaction:", err);
        });
    }
  }, [isAISpeaking]);

  // Determine display message based on state
  const getDisplayMessage = () => {
    if (error) return error;
    return currentMessage;
  };

  // Determine if typing animation should show
  const shouldShowTyping = appState === "responding" || appState === "session-ended";

  // Determine if recording should be disabled
  const isRecordingDisabled = appState === "processing" || appState === "session-ended";

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  return (
    <main 
      className="bg-black flex max-w-[400px] w-full flex-col overflow-hidden items-center mx-auto py-[40px] min-h-screen relative"
      onClick={handleEnableAudio}
    >
      {/* End Conversation Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:bg-white/10 hover:text-white"
              disabled={appState === "session-ended"}
              title="End conversation"
            >
              <X className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">End Conversation?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Are you sure you want to end this session? Once ended, you'll be taken to the summary page. You cannot continue this session after ending it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleEndSession}
                disabled={isEndingSession}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isEndingSession ? "Ending..." : "Yes, End Session"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <header className="text-white text-[28px] font-semibold tracking-wide">
        Kuku Coach
      </header>
      
      <section className="flex flex-col items-center justify-between w-full flex-1">
        <h2 className="text-white text-lg font-normal mt-[32px] opacity-90">
          {appState === "session-ended" ? "Session Complete" : "Speak to your coach"}
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
        <ThinkingIndicator isThinking={appState === "processing"} />
        
        {/* Message container */}
        <div className="min-h-[100px] flex items-center justify-center w-full px-6 mt-[20px]">
          <AIMessage 
            message={getDisplayMessage()}
            isTyping={shouldShowTyping}
          />
        </div>
        
        {/* Recording button - disabled when session ended */}
        <div className="mb-[50px] mt-[20px]">
          <RecordingButton 
            onRecordingChange={handleRecordingStateChange}
            onAudioComplete={handleAudioComplete}
            disabled={isRecordingDisabled}
          />
        </div>
      </section>
    </main>
  );
}
