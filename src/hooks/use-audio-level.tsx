
import * as React from "react";

interface UseAudioLevelOptions {
  isRecording: boolean;
}

export function useAudioLevel({ isRecording }: UseAudioLevelOptions) {
  const [audioLevel, setAudioLevel] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  
  const cleanup = React.useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (error) {
          console.error("Error closing audio context:", error);
        }
      }
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
  }, []);
  
  React.useEffect(() => {
    let isMounted = true;
    
    const processAudioLevel = () => {
      if (!analyserRef.current) return;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate the average volume level (0-255)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      
      // Normalize to 0-1 range
      const average = sum / dataArray.length / 255;
      
      if (isMounted) {
        setAudioLevel(average);
      }
      
      animationFrameRef.current = requestAnimationFrame(processAudioLevel);
    };
    
    const setupAudioProcessing = async () => {
      if (isRecording) {
        try {
          // Request microphone access
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          
          // Create audio context
          const audioContext = new AudioContext();
          audioContextRef.current = audioContext;
          
          // Create analyser
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          analyserRef.current = analyser;
          
          // Connect the microphone to the analyser
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          
          // Start processing audio data
          processAudioLevel();
        } catch (err) {
          console.error("Error accessing microphone:", err);
          if (isMounted) {
            setError("Error accessing microphone. Please make sure you have granted permission.");
            setAudioLevel(0);
          }
        }
      } else {
        // Clean up when not recording
        cleanup();
        if (isMounted) {
          setAudioLevel(0);
        }
      }
    };
    
    setupAudioProcessing();
    
    return () => {
      isMounted = false;
      cleanup();
    };
  }, [isRecording, cleanup]);
  
  return {
    audioLevel,
    error
  };
}
