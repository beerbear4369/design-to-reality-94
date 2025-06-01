import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

interface RecordingButtonProps {
  onRecordingChange?: (isRecording: boolean) => void;
  onAudioComplete?: (audioBlob: Blob) => Promise<void>;
  disabled?: boolean;
}

export function RecordingButton({ 
  onRecordingChange, 
  onAudioComplete,
  disabled = false 
}: RecordingButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Use the audio recorder hook
  const { audioBlob, error: recordingError, resetAudioBlob } = useAudioRecorder({ isRecording });
  
  // Track recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRecording) {
      setRecordingDuration(0);
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setRecordingDuration(elapsed);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // When audioBlob is available and we've stopped recording, send it
  useEffect(() => {
    if (audioBlob && !isRecording && onAudioComplete) {
      console.log(`🎙️ Audio recording complete: ${audioBlob.size} bytes`);
      
      // Send the audio blob to parent component
      onAudioComplete(audioBlob)
        .then(() => {
          console.log("✅ Audio processing started successfully");
          resetAudioBlob(); // Clear the blob after successful send
        })
        .catch((err) => {
          console.error("❌ Failed to process audio:", err);
          setError("Failed to process audio");
        });
    }
  }, [audioBlob, isRecording, onAudioComplete, resetAudioBlob]);

  // Handle toggle recording
  const handleToggleRecording = useCallback(() => {
    if (disabled) {
      console.log("🎙️ Recording disabled, ignoring click");
      return;
    }

    if (isRecording) {
      console.log("🎙️ Stopping recording");
      setIsRecording(false);
      onRecordingChange?.(false);
    } else {
      console.log("🎙️ Starting recording");
      setError(null);
      setIsRecording(true);
      onRecordingChange?.(true);
    }
  }, [isRecording, disabled, onRecordingChange]);

  // Combined error state
  const displayError = error || recordingError?.message;

  // Format recording duration (MM:SS)
  const formattedDuration = React.useMemo(() => {
    if (!recordingDuration) return "";
    const minutes = Math.floor(recordingDuration / 60);
    const seconds = Math.floor(recordingDuration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [recordingDuration]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Error message */}
      {displayError && (
        <div className="text-red-400 text-sm text-center max-w-[280px]">
          {displayError}
        </div>
      )}
      
      {/* Recording duration */}
      {isRecording && formattedDuration && (
        <div className="text-white/70 text-sm font-mono">
          {formattedDuration}
        </div>
      )}
      
      {/* Recording button */}
      <button
        className={`
          flex w-16 h-16 items-center justify-center rounded-full 
          focus:outline-none focus:ring-2 focus:ring-white/50 
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isRecording 
            ? "bg-[#e91e63] shadow-lg shadow-[#e91e63]/30 hover:bg-[#d81b60]" 
            : disabled 
              ? "bg-[#9c27b0] shadow-lg shadow-[#9c27b0]/30"
              : "bg-[#3f51b5] hover:bg-[#3949ab] shadow-lg shadow-[#3f51b5]/20"
          }
          ${displayError ? "border-2 border-red-400" : ""}
        `}
        onClick={handleToggleRecording}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        aria-pressed={isRecording}
        disabled={disabled}
        title={isRecording ? "Stop recording" : disabled ? "Processing" : "Start recording"}
      >
        {disabled && !isRecording ? (
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-7 h-7 text-white" />
        ) : (
          <Mic className="w-7 h-7 text-white" />
        )}
      </button>
    </div>
  );
}
