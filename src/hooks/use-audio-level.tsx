
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
      
      // Enhanced processing: Focus more on mid-range frequencies (human voice range)
      // This will make visualization more responsive to speech
      const voiceRangeStart = Math.floor(dataArray.length * 0.05); // Skip lowest frequencies
      const voiceRangeEnd = Math.floor(dataArray.length * 0.6);    // Skip highest frequencies
      
      let count = 0;
      // Give more weight to the voice frequency range
      for (let i = voiceRangeStart; i < voiceRangeEnd; i++) {
        sum += dataArray[i] * 1.5; // Boost the voice range
        count++;
      }
      
      // Include other frequencies at normal weight
      for (let i = 0; i < voiceRangeStart; i++) {
        sum += dataArray[i];
        count++;
      }
      for (let i = voiceRangeEnd; i < dataArray.length; i++) {
        sum += dataArray[i];
        count++;
      }
      
      // Normalize to 0-1 range
      const average = sum / count / 255;
      
      if (isMounted) {
        // Apply a smoother transition and enhance low sounds
        setAudioLevel(prev => {
          // Apply non-linear scaling to make visualization more responsive at lower volumes
          // Use a cubic root to give more presence to lower levels
          const enhancedLevel = Math.pow(average, 0.33);
          
          // Use different blending rates based on whether audio is increasing or decreasing
          const blendRate = enhancedLevel > prev ? 0.4 : 0.3; // Faster attack, slower decay
          
          // Smoothly blend current and previous values
          return prev * (1 - blendRate) + enhancedLevel * blendRate;
        });
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
          
          // Create analyser with higher FFT size for better resolution
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048; // Increased for much higher resolution
          analyser.smoothingTimeConstant = 0.7; // Add more smoothing (0-1)
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
