import { useState, useRef, useCallback, useEffect } from "react";

interface UseAudioRecorderProps {
  isRecording?: boolean;
  audioFormat?: string;
}

interface UseAudioRecorderResult {
  audioBlob: Blob | null;
  error: Error | null;
  recordingDuration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  saveRecording: (filename?: string) => void;
  resetAudioBlob: () => void;
}

export function useAudioRecorder({ 
  isRecording = false, 
  audioFormat = 'audio/webm' 
}: UseAudioRecorderProps = {}): UseAudioRecorderResult {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const processingTimeoutRef = useRef<number | null>(null);

  // Clean up function to reset resources
  const cleanup = useCallback(() => {
    console.log("Cleaning up recording resources");
    
    // Clear any pending timeouts
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    // Clear duration interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    // Stop and release media stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Clear MediaRecorder
    mediaRecorderRef.current = null;
    
    // Reset duration
    setRecordingDuration(0);
  }, []);

  // Process recording data into a blob
  const processRecording = useCallback(() => {
    // If already processed, skip
    if (audioBlob !== null) {
      console.log("Already processed recording, skipping duplicate processing");
      return audioBlob;
    }
    
    if (audioChunksRef.current.length === 0) {
      console.log("No audio chunks to process");
      return null;
    }
    
    const mimeType = (mediaRecorderRef.current && mediaRecorderRef.current.mimeType) || 'audio/webm';
    const blob = new Blob(audioChunksRef.current, { type: mimeType });
    
    console.log(`✅ Recording finished, blob size: ${blob.size} bytes, type: ${blob.type}`);
    setAudioBlob(blob);
    return blob;
  }, [audioBlob]);

  // Start recording function
  const startRecording = useCallback(async () => {
    try {
      // Clean up any previous recording session first
      cleanup();
      
      // Reset state
      setError(null);
      audioChunksRef.current = [];
      setAudioBlob(null);
      
      console.log("Starting new recording...");
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      mediaStreamRef.current = stream;
      
      // Find supported audio format
      let mimeType = audioFormat;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }
      }
      console.log(`Using audio format: ${mimeType || 'browser default'}`);
      
      // Create MediaRecorder with higher bitrate for better quality
      const options = mimeType ? { 
        mimeType,
        audioBitsPerSecond: 128000  // Higher bitrate for better quality
      } : undefined;
      
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      
      // Set up event handlers
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`Audio data received: ${event.data.size} bytes`);
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        console.log("MediaRecorder onstop event fired");
        
        if (audioChunksRef.current.length > 0) {
          processRecording();
        } else {
          console.log("No audio data collected in onstop handler");
        }
      };
      
      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError(new Error("An error occurred during recording."));
      };
      
      // Start duration tracking
      startTimeRef.current = Date.now();
      durationIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((Date.now() - startTimeRef.current) / 1000);
      }, 100);
      
      // Small delay before starting the recorder to ensure everything is ready
      // This helps prevent the first chunk from being cut off
      setTimeout(() => {
        // Use smaller chunks for more consistent data sizes
        if (recorder.state !== 'recording') {
          console.log("Starting MediaRecorder with small chunk size for consistent data");
          recorder.start(300);
        }
      }, 150);
      
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(err instanceof Error ? err : new Error("Error accessing microphone. Please check permissions."));
      cleanup();
    }
  }, [audioFormat, cleanup, processRecording]);

  // Stop recording function
  const stopRecording = useCallback(() => {
    console.log("Stopping recording...");
    
    // If the MediaRecorder hasn't started yet for some reason, do nothing
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      console.log("No active MediaRecorder to stop");
      return;
    }
    
    // Stop duration tracking
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    // Ensure we don't have any pending processing timeouts
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    // Create a flag to track if processing has occurred
    let hasProcessed = false;
    
    try {
      // First request all data accumulated so far
      mediaRecorderRef.current.requestData();
      
      // Small delay to ensure the last data is collected
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          // Stop recording - this will trigger the onstop event
          mediaRecorderRef.current.stop();
          console.log("MediaRecorder.stop() called");
          
          // If MediaRecorder.onstop doesn't trigger, process recording manually after delay
          processingTimeoutRef.current = window.setTimeout(() => {
            console.log("Checking if recording has been processed...");
            processingTimeoutRef.current = null;
            
            if (!hasProcessed && audioBlob === null && audioChunksRef.current.length > 0) {
              console.log("Manual processing of recording as fallback");
              hasProcessed = true;
              processRecording();
            }
            
            // CRITICAL FIX: Cleanup after processing is complete
            setTimeout(() => {
              console.log("🧹 Cleaning up MediaRecorder resources for next recording");
              cleanup();
            }, 100);
          }, 300);
        }
        
        // Stop and release media stream tracks (separate from cleanup to avoid race conditions)
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => {
            console.log(`Stopping media track: ${track.kind}`);
            track.stop();
          });
        }
      }, 100);
      
      // Update the onstop handler to set the hasProcessed flag
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => {
          console.log("MediaRecorder onstop event fired");
          
          if (audioChunksRef.current.length > 0 && !hasProcessed) {
            hasProcessed = true;
            processRecording();
          } else {
            console.log("No audio data collected in onstop handler or already processed");
          }
          
          // CRITICAL FIX: Cleanup after onstop processing is complete
          setTimeout(() => {
            console.log("🧹 Cleaning up MediaRecorder resources after onstop");
            cleanup();
          }, 100);
        };
      }
    } catch (err) {
      console.error("Error stopping MediaRecorder:", err);
      
      // Try to recover by manually processing the data
      if (audioChunksRef.current.length > 0 && !hasProcessed) {
        hasProcessed = true;
        processRecording();
      }
      
      // CRITICAL FIX: Cleanup even on error
      setTimeout(() => {
        console.log("🧹 Cleaning up MediaRecorder resources after error");
        cleanup();
      }, 100);
    }
  }, [audioBlob, processRecording, cleanup]);

  // Save recording to file
  const saveRecording = useCallback((filename = 'recording') => {
    if (!audioBlob) {
      console.error("No recording to save");
      return;
    }
    
    // Create file extension based on mime type
    const fileExtension = audioBlob.type.split('/')[1] || 'webm';
    const fullFilename = `${filename}.${fileExtension}`;
    
    // Create download link
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fullFilename;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log(`Recording saved as ${fullFilename}`);
  }, [audioBlob]);

  // Reset audio blob
  const resetAudioBlob = useCallback(() => {
    setAudioBlob(null);
    audioChunksRef.current = [];
  }, []);

  // React to isRecording prop changes
  useEffect(() => {
    if (isRecording && !mediaRecorderRef.current) {
      startRecording();
    } else if (!isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      stopRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    audioBlob,
    error,
    recordingDuration,
    startRecording,
    stopRecording,
    saveRecording,
    resetAudioBlob
  };
} 