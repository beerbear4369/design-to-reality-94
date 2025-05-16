import * as React from "react";
import { AIMessage } from "./ai-message";
import { RecordingButton } from "./recording-button";
import { VoiceVisualization } from "./voice-visualization";
import { useAudioLevel } from "@/hooks/use-audio-level";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

export function KukuCoach() {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const latestBlobRef = React.useRef<Blob | null>(null);
  
  // Audio recording hook with direct control functions
  const { 
    audioBlob, 
    isRecording,
    error: recorderError, 
    recordingDuration,
    startRecording,
    stopRecording,
    saveRecording
  } = useAudioRecorder();
  
  // Visualization hook
  const { audioLevel, frequencyData, error: audioLevelError } = useAudioLevel({ isRecording });

  // Combined error state
  const error = recorderError || audioLevelError;

  // Keep track of the latest blob
  React.useEffect(() => {
    if (audioBlob) {
      console.log(`Audio recording captured: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
      latestBlobRef.current = audioBlob;
    }
  }, [audioBlob]);

  // Force download of audio blob
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

  // Handle recording button click
  const handleRecordButtonClick = async () => {
    if (isProcessing) return; // Prevent actions while processing
    
    if (isRecording) {
      // User wants to stop recording
      console.log("User clicked to stop recording");
      setIsProcessing(true); // Set processing state
      
      // Stop the recording
      stopRecording();
      
      // Wait for recording to be processed with increasing delays
      const tryDownload = (attempts = 0) => {
        // Access the latest blob from our ref
        if (latestBlobRef.current) {
          console.log(`Downloading recorded audio (${latestBlobRef.current.size} bytes)...`);
          forceDownload(latestBlobRef.current);
          setIsProcessing(false); // Clear processing state
        } else if (audioBlob) {
          // Fallback to using the audioBlob state
          console.log(`Using audioBlob state (${audioBlob.size} bytes)...`);
          forceDownload(audioBlob);
          setIsProcessing(false); // Clear processing state
        } else if (attempts < 5) {
          // Try again with exponential backoff
          const delay = Math.min(1000 * Math.pow(1.5, attempts), 5000);
          console.log(`No audio blob available yet, retrying in ${delay}ms (attempt ${attempts + 1}/5)`);
          setTimeout(() => tryDownload(attempts + 1), delay);
        } else {
          console.error("Failed to get audio blob after multiple attempts");
          setIsProcessing(false); // Clear processing state
        }
      };
      
      // Start trying to download after a short initial delay
      setTimeout(() => tryDownload(), 500);
    } else {
      // User wants to start recording
      console.log("User clicked to start recording");
      // Reset refs and state
      latestBlobRef.current = null;
      await startRecording();
    }
  };

  return (
    <main className="bg-black flex max-w-[400px] w-full flex-col overflow-hidden items-center mx-auto py-[40px] min-h-screen">
      <header className="text-white text-[28px] font-semibold tracking-wide">
        Kuku Coach
      </header>
      
      <section className="flex flex-col items-center justify-between w-full flex-1">
        <h2 className="text-white text-lg font-normal mt-[32px] opacity-90">
          Speak to your coach
        </h2>
        
        {/* Voice visualization - enhanced sizing and positioning */}
        <div className="w-full flex justify-center mt-[30px]">
          <div className="w-[300px] h-[300px] relative">
            <VoiceVisualization 
              isRecording={isRecording} 
              audioLevel={audioLevel}
              frequencyData={frequencyData}
            />
          </div>
        </div>
        
        {/* Fixed height container for message with improved spacing */}
        <div className="min-h-[100px] flex items-center justify-center w-full px-6 mt-[20px]">
        <AIMessage 
          message={
            error ? 
              error : 
              isRecording ? 
                "I'm listening..." : 
                isProcessing ?
                  "Processing your recording..." :
                  "I'm here to help you with your goals.\nWhat would you like to discuss today?"
          } 
        />
        </div>
        
        {/* Recording button with better positioning and new props */}
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
