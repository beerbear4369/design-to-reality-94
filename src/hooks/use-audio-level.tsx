
import * as React from "react";

interface UseAudioLevelOptions {
  isRecording: boolean;
}

export function useAudioLevel({ isRecording }: UseAudioLevelOptions) {
  const [audioLevel, setAudioLevel] = React.useState(0);
  const [frequencyData, setFrequencyData] = React.useState<{
    low: number;
    mid: number;
    high: number;
    overall: number;
  }>({
    low: 0,
    mid: 0,
    high: 0,
    overall: 0
  });
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
      
      // Calculate different frequency bands
      const lowFrequencySum = calculateBandSum(dataArray, 0, 0.1); // 0-10% of spectrum for bass
      const midFrequencySum = calculateBandSum(dataArray, 0.1, 0.6); // 10-60% for mid-range (speech)
      const highFrequencySum = calculateBandSum(dataArray, 0.6, 1); // 60-100% for high frequencies
      
      // Normalize to 0-1 range with different emphasis for dynamics
      const lowNormalized = Math.pow(lowFrequencySum / 255, 0.5); // Less compression for bass
      const midNormalized = Math.pow(midFrequencySum / 255, 0.33); // Cubic root for mids (speech)
      const highNormalized = Math.pow(highFrequencySum / 255, 0.25); // More compression for high freqs
      
      // Calculate overall level with weighted emphasis on mid range (voice)
      const overallLevel = (lowNormalized * 0.2) + (midNormalized * 0.6) + (highNormalized * 0.2);
      
      if (isMounted) {
        // Update frequency data object
        setFrequencyData(prev => {
          return {
            // Apply different smoothing for different bands
            low: prev.low * 0.8 + lowNormalized * 0.2,    // Slower change for bass
            mid: prev.mid * 0.6 + midNormalized * 0.4,    // Faster for mids (speech)
            high: prev.high * 0.4 + highNormalized * 0.6, // Faster still for highs
            overall: prev.overall * 0.7 + overallLevel * 0.3  // Moderate overall smoothing
          };
        });
        
        // Update the overall audio level with improved dynamics
        setAudioLevel(prev => {
          // Use a non-linear scaling to make visualization more responsive at lower volumes
          const enhancedLevel = Math.pow(overallLevel, 0.33);
          
          // Use different blending rates based on whether audio is increasing or decreasing
          const blendRate = enhancedLevel > prev ? 0.4 : 0.3; // Faster attack, slower decay
          
          // Smoothly blend current and previous values
          return prev * (1 - blendRate) + enhancedLevel * blendRate;
        });
      }
      
      animationFrameRef.current = requestAnimationFrame(processAudioLevel);
    };
    
    // Helper function to calculate sum for a frequency band
    const calculateBandSum = (dataArray: Uint8Array, startPercentage: number, endPercentage: number) => {
      const start = Math.floor(dataArray.length * startPercentage);
      const end = Math.floor(dataArray.length * endPercentage);
      let sum = 0;
      let count = 0;
      
      for (let i = start; i < end; i++) {
        sum += dataArray[i];
        count++;
      }
      
      return count > 0 ? sum / count : 0;
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
            setFrequencyData({low: 0, mid: 0, high: 0, overall: 0});
          }
        }
      } else {
        // Clean up when not recording
        cleanup();
        if (isMounted) {
          setAudioLevel(0);
          setFrequencyData({low: 0, mid: 0, high: 0, overall: 0});
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
    frequencyData,
    error
  };
}

