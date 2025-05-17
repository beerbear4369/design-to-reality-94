import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAudioLevel } from "@/hooks/use-audio-level";
import { useConversation } from "@/hooks/useConversation";

interface RecordingButtonProps {
  onRecordingChange?: (isRecording: boolean) => void;
}

export function RecordingButton({ onRecordingChange }: RecordingButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Use a ref to track the latest audio blob
  const audioBlobRef = useRef<Blob | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  
  // Add a debug log function
  const addDebugLog = useCallback((message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev.slice(-5), message]);
  }, []);
  
  // Use our hooks
  const { audioLevel, frequencyData } = useAudioLevel({ isRecording });
  const { audioBlob, error: recordingError, resetAudioBlob } = useAudioRecorder({ isRecording });
  const { sendAudioData, status, error: sessionError, setError, sessionId } = useConversation();
  
  // Update audio blob ref when audioBlob changes
  useEffect(() => {
    audioBlobRef.current = audioBlob;
    if (audioBlob) {
      addDebugLog(`Audio blob available: ${audioBlob.size} bytes`);
    }
  }, [audioBlob, addDebugLog]);
  
  // Combine error states
  const error = internalError || recordingError?.message || sessionError;
  
  // Debug session ID changes
  useEffect(() => {
    if (sessionId) {
      addDebugLog(`Session ID updated: ${sessionId}`);
    }
  }, [sessionId, addDebugLog]);
  
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
  
  // Handle recording errors
  useEffect(() => {
    if (recordingError) {
      addDebugLog(`Recording error: ${recordingError.message}`);
      setInternalError(recordingError.message);
      setIsRecording(false);
      // Notify parent
      if (onRecordingChange) {
        onRecordingChange(false);
      }
    }
  }, [recordingError, onRecordingChange, addDebugLog]);
  
  // Clear error when status changes
  useEffect(() => {
    if (status === 'idle' && internalError) {
      setInternalError(null);
    }
    // Track status changes
    addDebugLog(`Session status: ${status}`);
  }, [status, internalError, addDebugLog]);
  
  // Notify parent component when recording state changes
  useEffect(() => {
    if (onRecordingChange) {
      onRecordingChange(isRecording);
    }
  }, [isRecording, onRecordingChange]);
  
  // Process and send the audio data - only triggered after recording is stopped
  const processAudioData = useCallback(async () => {
    // Prevent multiple simultaneous processing
    if (isProcessingRef.current) {
      addDebugLog("Already processing audio, skipping");
      return;
    }
    
    // Use the ref value to get the latest audio blob
    const currentBlob = audioBlobRef.current;
    
    if (!currentBlob) {
      addDebugLog("No audio blob available to process");
      return;
    }
    
    isProcessingRef.current = true;
    addDebugLog(`Processing audio blob: ${currentBlob.size} bytes`);
    
    try {
      // Send the audio data to the backend via useConversation
      await sendAudioData(currentBlob);
      addDebugLog("Successfully sent audio data");
      
      // Clear the audio blob to prevent reprocessing in case of accidental double-click
      resetAudioBlob();
      audioBlobRef.current = null;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      addDebugLog(`Error sending audio: ${errMsg}`);
      if (err instanceof Error) {
        setInternalError(err.message);
      } else {
        setInternalError('Unknown error processing audio');
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [sendAudioData, resetAudioBlob, addDebugLog]);
  
  // Handle toggle recording with clear separation between recording and processing
  const handleToggleRecording = useCallback(async () => {
    // If already recording, stop recording and then process the audio
    if (isRecording) {
      addDebugLog("Stopping recording");
      
      // First stop the recording
      setIsRecording(false);
      
      // Add a small delay to ensure the audio blob is fully created before processing
      // This ensures a sequential flow: 1) Stop recording completely, 2) Then process audio
      setTimeout(() => {
        addDebugLog("Recording stopped, processing audio data");
        processAudioData();
      }, 800);
    } 
    // If not recording and not in a processing/responding state, start recording
    else {
      // Clear any previous errors
      setInternalError(null);
      
      // Don't allow starting a new recording during processing or response
      if (status === 'processing' || status === 'responding') {
        addDebugLog(`Cannot start recording during ${status} state`);
        setInternalError("Please wait for the current response to complete");
        return;
      }
      
      addDebugLog("Starting recording");
      // Start recording
      setIsRecording(true);
    }
  }, [isRecording, status, processAudioData, addDebugLog]);
  
  // Determine if the button should be disabled
  const isProcessing = status === 'processing' || status === 'responding';
  
  // Format recording duration (MM:SS)
  const formattedDuration = React.useMemo(() => {
    if (!recordingDuration) return "";
    const minutes = Math.floor(recordingDuration / 60);
    const seconds = Math.floor(recordingDuration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [recordingDuration]);

  return (
    <div className="flex flex-col items-center">
      {/* Debug logs display */}
      <div className="text-xs bg-black/80 text-green-400 p-2 rounded mb-2 w-[300px] max-h-[100px] overflow-y-auto font-mono">
        {debugLogs.length > 0 ? (
          debugLogs.map((log, i) => <div key={i}>{log}</div>)
        ) : (
          <div>No debug logs yet</div>
        )}
      </div>
      
      {/* Recording duration display */}
      {isRecording && recordingDuration > 0 && (
        <div className="text-white/90 text-sm mb-2 font-mono">{formattedDuration}</div>
      )}
      
      {/* Status indicator */}
      {isProcessing && !isRecording && !error && (
        <div className="text-blue-400 text-xs mb-2 max-w-[200px] text-center">
          {status === 'processing' ? 'Processing...' : 'Listening to response...'}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="text-red-400 text-xs mb-2 max-w-[200px] text-center">{error}</div>
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
            : isProcessing 
              ? "bg-[#9c27b0] shadow-lg shadow-[#9c27b0]/30 hover:bg-[#8e24aa]"
              : "bg-[#3f51b5] hover:bg-[#3949ab] shadow-lg shadow-[#3f51b5]/20"
          }
          ${error ? "border-2 border-red-400" : ""}
        `}
        onClick={handleToggleRecording}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        aria-pressed={isRecording}
        disabled={isProcessing}
        title={isRecording ? "Stop recording" : isProcessing ? "Processing" : "Start recording"}
      >
        {isProcessing && !isRecording ? (
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
