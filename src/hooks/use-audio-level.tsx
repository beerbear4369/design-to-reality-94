import * as React from "react";

interface UseAudioLevelOptions {
  isRecording?: boolean;
  audioElement?: HTMLAudioElement | null;
}

// Keep track of which audio elements have been connected to avoid reconnection errors
const connectedAudioElements = new WeakSet<HTMLAudioElement>();

export function useAudioLevel({ isRecording = false, audioElement = null }: UseAudioLevelOptions) {
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
  const sourceNodeRef = React.useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const audioElementSourceRef = React.useRef<MediaElementAudioSourceNode | null>(null);
  
  // Track the last audio source type to handle switching between sources
  const lastSourceTypeRef = React.useRef<'microphone' | 'audioElement' | null>(null);
  
  const cleanupAudioContext = React.useCallback(() => {
    // Cancel any pending animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Disconnect the source node if it exists
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch (e) {
        console.log("Failed to disconnect source node:", e);
      }
      sourceNodeRef.current = null;
    }
    
    // Close the audio context if it exists
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.log("Failed to close audio context:", e);
      }
    }
    
    // Stop all tracks in the media stream if it exists
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {
        console.log("Failed to stop media stream tracks:", e);
      }
      mediaStreamRef.current = null;
    }
    
    // Reset all refs
    audioContextRef.current = null;
    analyserRef.current = null;
    audioElementSourceRef.current = null;
    lastSourceTypeRef.current = null;
    
    // Reset state
    setAudioLevel(0);
    setFrequencyData({
      low: 0,
      mid: 0,
      high: 0,
      overall: 0
    });
    setError(null);
  }, []);
  
  // Function to analyze audio data
  const analyzeAudioData = React.useCallback(() => {
    if (!analyserRef.current) {
      return;
    }
    
    try {
      // Create a typed array to store time domain data
      const dataArray = new Uint8Array(analyserRef.current.fftSize);
      
      // Get the time domain data
      analyserRef.current.getByteTimeDomainData(dataArray);
      
      // Calculate RMS (Root Mean Square) amplitude
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        // Convert 0-255 to -1 to 1
        const amplitude = (dataArray[i] - 128) / 128;
        // Square the amplitude
        sum += amplitude * amplitude;
      }
      
      // Calculate the RMS
      const rms = Math.sqrt(sum / dataArray.length);
      
      // Scale from 0-1 with some non-linearity for better visualization
      const scaledLevel = Math.min(1, Math.pow(rms * 5, 1.5));
      
      // Set audio level
      setAudioLevel(scaledLevel);
      
      // Get frequency data for visualization
      const frequencyDataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(frequencyDataArray);
      
      // Split the frequency range into bands
      const lowBandEnd = Math.floor(analyserRef.current.frequencyBinCount * 0.1); // First 10%
      const midBandEnd = Math.floor(analyserRef.current.frequencyBinCount * 0.5); // First 50%
      
      // Calculate average energy in each band
      let lowSum = 0;
      let midSum = 0;
      let highSum = 0;
      let totalSum = 0;
      
      for (let i = 0; i < frequencyDataArray.length; i++) {
        const value = frequencyDataArray[i] / 255; // Normalize to 0-1
        
        if (i < lowBandEnd) {
          lowSum += value;
        } else if (i < midBandEnd) {
          midSum += value;
        } else {
          highSum += value;
        }
        
        totalSum += value;
      }
      
      // Normalize by the number of bins in each band
      const lowAvg = lowSum / lowBandEnd;
      const midAvg = midSum / (midBandEnd - lowBandEnd);
      const highAvg = highSum / (frequencyDataArray.length - midBandEnd);
      const totalAvg = totalSum / frequencyDataArray.length;
      
      // Scale the values for visualization
      setFrequencyData({
        low: Math.min(1, Math.pow(lowAvg * 2, 1.2)),
        mid: Math.min(1, Math.pow(midAvg * 2, 1.2)),
        high: Math.min(1, Math.pow(highAvg * 3, 1.2)), // Boost highs a little more
        overall: Math.min(1, Math.pow(totalAvg * 2, 1.2))
      });
      
      // Request next frame
      animationFrameRef.current = requestAnimationFrame(analyzeAudioData);
    } catch (err) {
      console.error("Error analyzing audio data:", err);
      // Schedule next frame even if there was an error
      animationFrameRef.current = requestAnimationFrame(analyzeAudioData);
    }
  }, []);
  
  // Setup microphone input
  const setupMicrophoneInput = React.useCallback(async () => {
    try {
      if (lastSourceTypeRef.current === 'microphone') {
        // Already set up for microphone, just continue analysis
        if (analyserRef.current && audioContextRef.current) {
          animationFrameRef.current = requestAnimationFrame(analyzeAudioData);
          return;
        }
      }
      
      // Clean up any existing connections before setting up new ones
      cleanupAudioContext();
      
      // Create a new audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Create an analyzer
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // Must be a power of 2
      analyserRef.current = analyser;
      
      // Create a source from the microphone
      const source = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = source;
      
      // Connect the source to the analyzer
      source.connect(analyser);
      
      // Set the source type
      lastSourceTypeRef.current = 'microphone';
      
      // Start analyzing
      animationFrameRef.current = requestAnimationFrame(analyzeAudioData);
      
      // Reset any errors
      setError(null);
    } catch (err) {
      console.error("Error setting up microphone:", err);
      setError("Could not access microphone");
      
      // Fall back to zero levels
      setAudioLevel(0);
      setFrequencyData({
        low: 0,
        mid: 0,
        high: 0,
        overall: 0
      });
      
      // Clean up any partial setup
      cleanupAudioContext();
    }
  }, [analyzeAudioData, cleanupAudioContext]);
  
  // Setup audio element input
  const setupAudioElementInput = React.useCallback(() => {
    if (!audioElement) {
      return;
    }
    
    try {
      // Check if we're already connected to this audio element
      if (lastSourceTypeRef.current === 'audioElement' && 
          audioElementSourceRef.current && 
          connectedAudioElements.has(audioElement)) {
        // Already set up for this audio element, just continue analysis
        if (analyserRef.current && audioContextRef.current) {
          animationFrameRef.current = requestAnimationFrame(analyzeAudioData);
          return;
        }
      }
      
      // Clean up any existing connections before setting up new ones
      cleanupAudioContext();
      
      // Create a new audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      // Create an analyzer
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // Must be a power of 2
      analyserRef.current = analyser;
      
      // Check if this audio element has been connected before
      if (connectedAudioElements.has(audioElement)) {
        console.log("Audio element was previously connected. Creating new connection.");
      }
      
      // Create a source from the audio element
      const source = audioContext.createMediaElementSource(audioElement);
      sourceNodeRef.current = source;
      audioElementSourceRef.current = source;
      
      // Connect the source to the analyzer and to the destination
      source.connect(analyser);
      source.connect(audioContext.destination); // Connect to speakers
      
      // Mark this audio element as connected
      connectedAudioElements.add(audioElement);
      
      // Set the source type
      lastSourceTypeRef.current = 'audioElement';
      
      // Start analyzing
      animationFrameRef.current = requestAnimationFrame(analyzeAudioData);
      
      // Reset any errors
      setError(null);
      
      console.log("Audio element visualization setup complete");
    } catch (err) {
      console.error("Error setting up audio element visualization:", err);
      setError("Could not visualize audio element");
      
      // Fall back to zero levels
      setAudioLevel(0);
      setFrequencyData({
        low: 0,
        mid: 0,
        high: 0,
        overall: 0
      });
      
      // Clean up any partial setup
      cleanupAudioContext();
    }
  }, [audioElement, analyzeAudioData, cleanupAudioContext]);
  
  // Effect to handle recording state changes
  React.useEffect(() => {
    // Determine which setup to use based on inputs
    if (isRecording) {
      setupMicrophoneInput();
    } else if (audioElement && audioElement.src) {
      setupAudioElementInput();
    } else {
      // No active source, clean up
      cleanupAudioContext();
      
      // Reset levels to zero
      setAudioLevel(0);
      setFrequencyData({
        low: 0,
        mid: 0,
        high: 0,
        overall: 0
      });
    }
    
    // Clean up function
    return () => {
      cleanupAudioContext();
    };
  }, [isRecording, audioElement, setupMicrophoneInput, setupAudioElementInput, cleanupAudioContext]);
  
  return { audioLevel, frequencyData, error };
}

