import * as React from "react";
import { AIMessage } from "./ai-message";
import { RecordingButton } from "./recording-button";
import { VoiceVisualization } from "./voice-visualization";
import { ThinkingIndicator } from "./thinking-indicator";
import { useAudioLevel } from "@/hooks/use-audio-level";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSession, SessionStatus } from "@/contexts/SessionContext";
import { revokeAllAudioUrls } from "@/services/audio-generator";

export function KukuCoach() {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const latestBlobRef = React.useRef<Blob | null>(null);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);
  const [isAISpeaking, setIsAISpeaking] = React.useState(false);
  const [aiAudioLevel, setAIAudioLevel] = React.useState(0);
  
  // Get session context
  const { 
    status: sessionStatus, 
    setStatus: setSessionStatus, 
    messages,
    sendMessage,
    error: sessionError,
    setError: setSessionError
  } = useSession();
  
  // Audio recording hook with direct control functions
  const { 
    audioBlob, 
    isRecording,
    error: recorderError, 
    recordingDuration,
    startRecording,
    stopRecording
  } = useAudioRecorder();
  
  // Visualization hook
  const { audioLevel, frequencyData, error: audioLevelError } = useAudioLevel({ isRecording });

  // Combined error state
  const error = recorderError || audioLevelError || sessionError;

  // Latest message for display
  const latestMessage = React.useMemo(() => {
    if (messages.length === 0) {
      return "I'm here to help you with your goals.\nWhat would you like to discuss today?";
    }
    return messages[messages.length - 1].text;
  }, [messages]);

  // Keep track of the latest blob
  React.useEffect(() => {
    if (audioBlob) {
      console.log(`Audio recording captured: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
      latestBlobRef.current = audioBlob;
    }
  }, [audioBlob]);

  // Simulate audio levels for AI speech
  React.useEffect(() => {
    let animationId: number;
    
    if (isAISpeaking) {
      let time = 0;
      
      const animateAIAudioLevel = () => {
        // Generate a somewhat natural looking audio level pattern
        // Base level with some randomness
        const base = 0.3 + Math.random() * 0.1;
        
        // Add sine wave modulation 
        const sineModulation = Math.sin(time) * 0.15;
        
        // Add occasional peaks
        const peaks = Math.random() > 0.9 ? Math.random() * 0.4 : 0;
        
        // Combined level with clamping
        const level = Math.max(0, Math.min(1, base + sineModulation + peaks));
        
        setAIAudioLevel(level);
        time += 0.1;
        
        animationId = requestAnimationFrame(animateAIAudioLevel);
      };
      
      animateAIAudioLevel();
    } else {
      setAIAudioLevel(0);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAISpeaking]);

  // Play audio when a new AI message is received
  React.useEffect(() => {
    // Only play audio if the session is in the responding state
    if (sessionStatus === "responding" && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      // Only play audio for AI messages with an audioUrl
      if (latestMessage.sender === "ai" && latestMessage.audioUrl) {
        console.log(`Playing AI response audio from URL`);
        
        // Create audio element if it doesn't exist
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio();
          
          // When audio ends, set session to idle
          audioPlayerRef.current.onended = () => {
            console.log("Audio playback finished");
            setIsAISpeaking(false);
            setSessionStatus("idle");
          };
          
          // Log errors
          audioPlayerRef.current.onerror = (e) => {
            console.error("Audio playback error:", e);
            setIsAISpeaking(false);
            setSessionError("Could not play audio response");
            setSessionStatus("error");
          };
        }
        
        // Stop any currently playing audio
        if (!audioPlayerRef.current.paused) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current.currentTime = 0;
        }
        
        // Set the source and play
        audioPlayerRef.current.src = latestMessage.audioUrl;
        
        // Attempt to play with retry logic for browser autoplay restrictions
        const playWithRetry = (attempts = 0) => {
          audioPlayerRef.current?.play()
            .then(() => {
              console.log("Audio playback started successfully");
              setIsAISpeaking(true);
            })
            .catch(err => {
              console.warn(`Audio playback failed (attempt ${attempts + 1}/3):`, err);
              
              if (attempts < 2) {
                // Retry with a small delay
                setTimeout(() => playWithRetry(attempts + 1), 300);
              } else {
                // After 3 attempts, give up and move to idle state
                console.error("Could not autoplay audio after multiple attempts");
                setIsAISpeaking(false);
                setSessionStatus("idle");
              }
            });
        };
        
        // Start playback attempt
        playWithRetry();
      }
    } else if (sessionStatus !== "responding") {
      // Ensure AI speaking is off when not in responding state
      setIsAISpeaking(false);
    }
  }, [messages, sessionStatus, setSessionStatus, setSessionError]);

  // Force download of audio blob for testing during development
  const forceDownload = (blob: Blob) => {
    if (!blob || blob.size === 0) {
      console.error("Invalid blob for download");
      return;
    }
    
    console.log("Forcing download of audio blob...");
    
    try {
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      
      // Set the download attributes
      const filename = `kuku-coach-recording-${Date.now()}.webm`;
      a.href = url;
      a.download = filename;
      
      // Trigger the download
      console.log(`Initiating download of ${filename} (${blob.size} bytes)`);
      a.click();
      
      // Clean up with a slightly longer timeout to ensure the download starts
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log("Download resource cleanup complete");
      }, 500);
      
      console.log("Download triggered!");
    } catch (err) {
      console.error("Error during download:", err);
    }
  };

  // Process the recording and send to backend (or download for now)
  const processRecording = async (blob: Blob) => {
    try {
      setIsProcessing(true);
      
      // TODO: In production, send the audio to the backend for processing
      // For now, we'll just simulate some text extraction and download the file
      
      // Simulate a transcription (in production this would come from the backend)
      const simulatedTranscription = "This is a sample user message that would normally be transcribed from the audio.";
      
      // Send the message to the session context
      await sendMessage(simulatedTranscription, blob);
      
      // For development - download the audio file for testing
      forceDownload(blob);
      
      setIsProcessing(false);
    } catch (err) {
      console.error("Error processing recording:", err);
      setIsProcessing(false);
    }
  };

  // Handle recording button click
  const handleRecordButtonClick = async () => {
    if (isProcessing) return; // Prevent actions while processing
    
    if (isRecording) {
      // User wants to stop recording
      console.log("User clicked to stop recording");
      setIsProcessing(true); // Set processing state
      setSessionStatus("processing");
      
      // Stop the recording
      stopRecording();
      
      // Wait for recording to be processed with increasing delays
      const tryProcessAudio = (attempts = 0) => {
        // Access the latest blob from our ref
        if (latestBlobRef.current) {
          console.log(`Processing recorded audio (${latestBlobRef.current.size} bytes)...`);
          processRecording(latestBlobRef.current);
        } else if (audioBlob) {
          // Fallback to using the audioBlob state
          console.log(`Using audioBlob state (${audioBlob.size} bytes)...`);
          processRecording(audioBlob);
        } else if (attempts < 5) {
          // Try again with exponential backoff
          const delay = Math.min(1000 * Math.pow(1.5, attempts), 5000);
          console.log(`No audio blob available yet, retrying in ${delay}ms (attempt ${attempts + 1}/5)`);
          setTimeout(() => tryProcessAudio(attempts + 1), delay);
        } else {
          console.error("Failed to get audio blob after multiple attempts");
          setIsProcessing(false); // Clear processing state
          setSessionStatus("error");
        }
      };
      
      // Start trying to process after a short initial delay
      setTimeout(() => tryProcessAudio(), 500);
    } else {
      // User wants to start recording
      console.log("User clicked to start recording");
      // Reset refs and state before starting
      latestBlobRef.current = null;
      setSessionStatus("recording");
      await startRecording();
    }
  };

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
      revokeAllAudioUrls();
    };
  }, []);

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
              audioLevel={isRecording ? audioLevel : aiAudioLevel}
              frequencyData={{
                low: isRecording ? frequencyData.low : aiAudioLevel * 0.8,
                mid: isRecording ? frequencyData.mid : aiAudioLevel,
                high: isRecording ? frequencyData.high : aiAudioLevel * 0.5,
                overall: isRecording ? frequencyData.overall : aiAudioLevel * 0.7
              }}
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
          <RecordingButton 
            isRecording={isRecording} 
            onClick={handleRecordButtonClick} 
            isProcessing={isProcessing}
            error={error}
            recordingDuration={recordingDuration}
          />
        </div>
      </section>
    </main>
  );
}
