# Production API Changes: Kuku Coach

## Audio Recording API Integration

For the production version, we need to modify the audio recording functionality to integrate with the backend API instead of downloading files locally. Here are the specific changes required:

### 1. KukuCoach Component Changes

Replace the download functionality with API calls:

```typescript
// In kuku-coach.tsx

// REMOVE: Local download functionality
const forceDownload = (blob: Blob) => {
  // ... existing download code ...
};

// ADD: Send audio to backend
const sendAudioToBackend = async (blob: Blob) => {
  try {
    setIsProcessing(true);
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('audio', blob, `recording-${Date.now()}.webm`);
    formData.append('sessionId', sessionId); // Get from context or params
    
    // Send to backend
    const response = await fetch('/api/audio/transcribe', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Error sending audio: ${response.statusText}`);
    }
    
    // Process response
    const data = await response.json();
    console.log('Audio processed by backend:', data);
    
    // Trigger "thinking" state
    // This will be managed by WebSocket in the full implementation
    
    setIsProcessing(false);
  } catch (err) {
    console.error('Error sending audio to backend:', err);
    setError('Failed to send recording to the server. Please try again.');
    setIsProcessing(false);
  }
};

// In handleRecordButtonClick, replace download with API call:
if (isRecording) {
  // User wants to stop recording
  console.log("User clicked to stop recording");
  setIsProcessing(true);
  
  // Stop the recording
  stopRecording();
  
  // Wait for recording to be processed
  const tryProcessAudio = (attempts = 0) => {
    if (latestBlobRef.current) {
      console.log(`Sending recorded audio to backend (${latestBlobRef.current.size} bytes)...`);
      sendAudioToBackend(latestBlobRef.current);
    } else if (audioBlob) {
      console.log(`Using audioBlob state (${audioBlob.size} bytes)...`);
      sendAudioToBackend(audioBlob);
    } else if (attempts < 5) {
      // Try again with exponential backoff
      const delay = Math.min(1000 * Math.pow(1.5, attempts), 5000);
      console.log(`No audio blob available yet, retrying in ${delay}ms (attempt ${attempts + 1}/5)`);
      setTimeout(() => tryProcessAudio(attempts + 1), delay);
    } else {
      console.error("Failed to get audio blob after multiple attempts");
      setIsProcessing(false);
      setError("Failed to process recording. Please try again.");
    }
  };
  
  // Start trying to process after a short initial delay
  setTimeout(() => tryProcessAudio(), 500);
}
```

### 2. WebSocket Integration

For real-time communication with the backend:

```typescript
// In kuku-coach.tsx - Add WebSocket connection
const wsRef = useRef<WebSocket | null>(null);

// Setup WebSocket connection
useEffect(() => {
  const ws = new WebSocket('wss://your-backend-url/ws');
  
  ws.onopen = () => {
    console.log('WebSocket connection established');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.event) {
      case 'server:thinking':
        // Show thinking state
        break;
      case 'server:response':
        // Display text response with typing animation
        break;
      case 'server:audio-response':
        // Play audio response
        break;
      default:
        console.log('Unknown event:', data.event);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    setError('Connection error. Please refresh the page.');
  };
  
  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };
  
  wsRef.current = ws;
  
  // Cleanup
  return () => {
    ws.close();
  };
}, []);

// Send audio data via WebSocket
const sendAudioViaWebSocket = (blob: Blob) => {
  if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
    console.error('WebSocket not connected');
    setError('Connection error. Please refresh the page.');
    return;
  }
  
  // First send event that recording has stopped
  wsRef.current.send(JSON.stringify({
    event: 'client:stop-recording',
    sessionId: sessionId
  }));
  
  // Then send the audio blob
  // For large files, you may need to chunk this
  wsRef.current.send(JSON.stringify({
    event: 'client:audio-data',
    sessionId: sessionId,
    // You'd need to convert blob to base64 or use a binary protocol
    audio: convertBlobToBase64(blob)
  }));
};
```

### 3. Audio Playback Integration

To play back AI responses:

```typescript
// In kuku-coach.tsx - Add audio playback functionality
const audioRef = useRef<HTMLAudioElement | null>(null);

// Function to play audio response
const playAudioResponse = (audioUrl: string) => {
  if (!audioRef.current) {
    audioRef.current = new Audio();
  }
  
  audioRef.current.src = audioUrl;
  audioRef.current.play().catch(err => {
    console.error('Error playing audio:', err);
  });
};

// In render - Add hidden audio element
<audio ref={audioRef} style={{ display: 'none' }} />
```

## Implementation Checklist

1. [ ] Replace local download with backend API calls
2. [ ] Implement WebSocket connection for real-time updates
3. [ ] Add error handling for network failures
4. [ ] Implement audio transmission with proper formatting
5. [ ] Create audio playback mechanisms for AI responses
6. [ ] Add visual indicators for all states (recording, thinking, responding)
7. [ ] Update the session context to include conversation history
8. [ ] Implement retry logic for failed API calls
9. [ ] Add session persistence for page refreshes

## Security Considerations

- Ensure audio data is transmitted securely (HTTPS)
- Implement rate limiting to prevent abuse
- Add CSRF protection for API endpoints
- Consider authentication mechanisms for production
- Sanitize and validate all user inputs
- Secure WebSocket connections with proper authentication