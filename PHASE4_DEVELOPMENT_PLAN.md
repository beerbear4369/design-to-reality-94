# Kuku Coach: Phase 4 Development Plan

## Core Voice Interaction Logic Implementation

This document outlines the detailed plan for implementing Phase 4 of the Kuku Coach application: Core Voice Interaction Logic with mock backend services.

## Overview

Phase 4 focuses on implementing the fundamental voice interaction functionality of Kuku Coach, including:
- Real-time audio recording and processing
- Mock backend services that mirror the proposed microservices architecture
- Complete conversation flow with proper state management
- Typed response animation and "thinking" state indicators

## Architecture

### Frontend Components
```
src/
├── components/kuku-coach/
│   ├── voice-visualization.tsx (existing, to be enhanced)
│   ├── recording-button.tsx (existing, to be enhanced)
│   ├── ai-message.tsx (existing, to be enhanced)
│   └── thinking-indicator.tsx (new)
├── hooks/
│   ├── useAudioRecorder.ts (new)
│   ├── useConversation.ts (new)
│   └── useWebSocket.ts (new)
├── context/
│   └── SessionContext.tsx (new)
└── services/
    ├── api/
    │   ├── index.ts
    │   ├── conversation.ts
    │   └── audio.ts
    ├── websocket/
    │   ├── index.ts
    │   └── events.ts
    ├── mock/
    │   ├── responses.ts
    │   └── delays.ts
    └── storage/
        └── index.ts
```

### Mock Backend Services
```
Services
├── API Gateway
│   ├── Conversation Endpoints
│   │   ├── POST /api/conversations - Create new session
│   │   ├── GET /api/conversations/{id} - Get conversation
│   │   └── PUT /api/conversations/{id} - End session
│   └── Audio Endpoints
│       ├── POST /api/audio/transcribe - Convert audio to text
│       └── POST /api/audio/synthesize - Convert text to audio
├── WebSocket Server
│   ├── Client Events
│   │   ├── client:start-recording - Start sending audio
│   │   ├── client:audio-data - Send audio chunk
│   │   └── client:stop-recording - Stop recording
│   └── Server Events
│       ├── server:thinking - Processing indicator
│       ├── server:response - Text response
│       └── server:audio-response - Audio response
└── Storage Service
    └── LocalStorage Persistence
```

## Implementation Plan

### Stage 1: Mock Backend Service Creation

**Objective:** Create a simulated backend service structure that mirrors the proposed microservices architecture.

**Tasks:**
1. **API Service Setup**
   - Create `src/services/api/index.ts` for central configuration
   - Implement `src/services/api/conversation.ts` with:
     - `createSession()`: Generate session ID and initial state
     - `getConversation(id)`: Retrieve session data
     - `endSession(id)`: Finalize session and generate summary
   - Implement `src/services/api/audio.ts` with:
     - `transcribeAudio(blob)`: Simulate transcription (return mock text)
     - `synthesizeSpeech(text)`: Simulate text-to-speech (return audio URL)

2. **WebSocket Service Setup**
   - Create `src/services/websocket/index.ts` for connection management
   - Implement `src/services/websocket/events.ts` for event handling:
     - Client event handlers: start-recording, audio-data, stop-recording
     - Server event emitters: thinking, response, audio-response
   - Add simulated processing delays (2 seconds for "thinking" state)

3. **Storage Service Setup**
   - Create `src/services/storage/index.ts` with:
     - `saveConversation(id, data)`: Save to localStorage
     - `getConversation(id)`: Retrieve from localStorage
     - `getAllConversations()`: List all stored conversations
     - `clearConversation(id)`: Remove specific conversation

4. **Mock Data Setup**
   - Create `src/services/mock/responses.ts` with:
     - Collection of AI coaching responses
     - Simple logic for contextual selection
   - Create `src/services/mock/delays.ts` for simulated timing

**Deliverables:**
- Complete mock service structure
- Local storage persistence implementation
- Simulated API endpoints and WebSocket events

### Stage 2: Audio Recording & Processing

**Objective:** Implement audio recording functionality that works alongside the existing visualization system.

**Tasks:**
1. **Audio Recording Hook**
   - Create `src/hooks/useAudioRecorder.ts` with:
     - Microphone access and permission handling
     - MediaRecorder implementation for WAV capture
     - Start/stop recording functionality
     - Error handling for permission issues
     - Focus solely on audio capture (no visualization responsibilities)

2. **Recording Button Enhancement**
   - Update recording button component:
     - Trigger both hooks with the same recording state:
       ```jsx
       // Share isRecording state between both hooks
       const { audioLevel, frequencyData } = useAudioLevel({ isRecording });
       const { audioBlob, isProcessing, error } = useAudioRecorder({ isRecording });
       ```
     - Manage recording state transitions
     - Handle permission errors from either hook
     - Provide appropriate accessibility attributes

**Approach:**
- Keep the existing visualization system unchanged
- Use a dual-hook system with clear separation of concerns:
  - `useAudioLevel`: Continues to handle audio analysis for visualization (no changes)
  - `useAudioRecorder`: Focuses only on recording the actual audio for backend transmission
- Both hooks will share the same `isRecording` state from the parent component

**Deliverables:**
- Functional audio recording with WAV output
- Parallel operation with the existing visualization system
- Complete microphone permission handling
- Audio blob/data ready for WebSocket transmission to backend

### Stage 3: Conversation UI Flow

**Objective:** Implement the complete conversation flow UI with proper state indicators.

**Tasks:**
1. **Session Context**
   - Create `src/context/SessionContext.tsx` with:
     - Session state management (id, history, status)
     - Conversation actions (start, send, end)
     - Message history tracking
     - Persistence handling

2. **Thinking Indicator**
   - Create `src/components/kuku-coach/thinking-indicator.tsx`:
     - Display "Kuku is thinking..." message
     - Add subtle animation for waiting state
     - Ensure proper transitions between states

3. **AI Message Enhancement**
   - Update existing AI message component:
     - Add typed response animation using a typing library
     - Handle multiple message display
     - Implement scrolling for conversation history

4. **Conversation States**
   - Implement state machine for conversation flow:
     - IDLE: Ready for user input
     - RECORDING: Capturing user audio
     - PROCESSING: "Thinking" state
     - RESPONDING: Displaying/playing AI response
     - ERROR: Handling error conditions

**Deliverables:**
- Complete conversation state management
- Visual indicators for all states
- Typed response animation for AI messages
- Scrollable conversation history display

### Stage 4: Frontend-Backend Integration

**Objective:** Connect all frontend components to the mock backend services.

**Tasks:**
1. **WebSocket Integration**
   - Create `src/hooks/useWebSocket.ts`:
     - Wrap the existing `webSocketService` into a React hook
     - Provide connection management (connect/disconnect on component mount/unmount)
     - Auto-reconnection with exponential backoff
     - Typed event handler registration with proper cleanup
     - Implementation example:
       ```typescript
       function useWebSocket() {
         const [isConnected, setIsConnected] = useState(false);
         const [error, setError] = useState<Error | null>(null);
         
         // Connect on mount, disconnect on unmount
         useEffect(() => {
           webSocketService.connect();
           const handleConnect = () => setIsConnected(true);
           const handleDisconnect = () => setIsConnected(false);
           
           webSocketService.on(CONNECTION_EVENTS.CONNECT, handleConnect);
           webSocketService.on(CONNECTION_EVENTS.DISCONNECT, handleDisconnect);
           
           return () => {
             webSocketService.off(CONNECTION_EVENTS.CONNECT, handleConnect);
             webSocketService.off(CONNECTION_EVENTS.DISCONNECT, handleDisconnect);
             webSocketService.disconnect();
           };
         }, []);
         
         // Event subscription helper with automatic cleanup
         const subscribe = useCallback(<T>(event: string, callback: (data: T) => void) => {
           webSocketService.on(event, callback);
           return () => webSocketService.off(event, callback);
         }, []);
         
         return { isConnected, error, emit: webSocketService.emit, subscribe };
       }
       ```

2. **Session Management**
   - Implement `useConversation` hook:
     - Integrate SessionContext with WebSocket and API services
     - State management for sending/receiving messages
     - Connection between audio recording and data transmission
     - Implementation example:
       ```typescript
       function useConversation() {
         const session = useSession(); // From existing SessionContext
         const { subscribe, emit, isConnected } = useWebSocket();
         const [isProcessing, setIsProcessing] = useState(false);
         
         // Register WebSocket event handlers
         useEffect(() => {
           const unsubscribeThinking = subscribe<void>(
             SERVER_EVENTS.THINKING, 
             () => session.setStatus('processing')
           );
           
           const unsubscribeResponse = subscribe<ResponseEvent>(
             SERVER_EVENTS.RESPONSE,
             (data) => {
               // Add AI message to session
               const aiMessage: Message = {
                 id: data.messageId || `msg-${Date.now()}`,
                 timestamp: new Date().toISOString(),
                 sender: 'ai',
                 text: data.text
               };
               
               // Update session state
               session.messages.push(aiMessage);
               session.setStatus('responding');
             }
           );
           
           const unsubscribeAudioResponse = subscribe<AudioResponseEvent>(
             SERVER_EVENTS.AUDIO_RESPONSE,
             (data) => {
               // Update the corresponding message with audio URL
               const updatedMessages = session.messages.map(msg => 
                 msg.id === data.messageId ? { ...msg, audioUrl: data.audioUrl } : msg
               );
               
               // Update session with new messages
               // In actual implementation, this would be handled by SessionContext
             }
           );
           
           return () => {
             unsubscribeThinking();
             unsubscribeResponse();
             unsubscribeAudioResponse();
           };
         }, [subscribe, session]);
         
         // Send audio data through WebSocket
         const sendAudioData = useCallback((audioBlob: Blob) => {
           if (!isConnected) return Promise.reject(new Error('WebSocket not connected'));
           
           // Start recording process
           emit(CLIENT_EVENTS.START_RECORDING);
           
           // In a real implementation, we would chunk and stream the audio
           // For simplicity in the mock version, we just send the full blob
           emit(CLIENT_EVENTS.AUDIO_DATA, { 
             chunk: audioBlob,
             timestamp: Date.now()
           });
           
           // Signal recording end
           emit(CLIENT_EVENTS.STOP_RECORDING);
           
           return Promise.resolve();
         }, [emit, isConnected]);
         
         return {
           ...session,
           sendAudioData,
           isConnected
         };
       }
       ```

3. **Full Conversation Flow Integration**
   - Update the recording button component:
     - Connect to `useConversation` hook
     - Send recorded audio data via WebSocket
     - Handle recording state transitions
     - Update example:
       ```tsx
       function RecordingButton() {
         const [isRecording, setIsRecording] = useState(false);
         const { audioLevel, frequencyData } = useAudioLevel({ isRecording });
         const { audioBlob, error: recordingError } = useAudioRecorder({ isRecording });
         const { sendAudioData, status, setError } = useConversation();
         
         // Toggle recording state
         const toggleRecording = async () => {
           if (isRecording) {
             setIsRecording(false);
             
             // If we have recorded audio, send it
             if (audioBlob) {
               try {
                 await sendAudioData(audioBlob);
               } catch (err) {
                 setError(err.message);
               }
             }
           } else {
             setIsRecording(true);
           }
         };
         
         // Handle recording errors
         useEffect(() => {
           if (recordingError) {
             setError(recordingError.message);
             setIsRecording(false);
           }
         }, [recordingError, setError]);
         
         return (
           <Button 
             onClick={toggleRecording}
             disabled={status === 'processing' || status === 'responding'}
             className={isRecording ? 'recording' : ''}
           >
             {isRecording ? 'Stop' : 'Start'}
           </Button>
         );
       }
       ```

   - Enhance KukuCoach main component:
     - Coordinate recording, thinking, and response states
     - Manage conversation flow between components
     - Handle audio playback for AI responses

4. **Comprehensive Error Handling**
   - Implement error boundaries at key component points:
     - `try/catch` for all audio operations
     - Fallback UI for when components fail
     - Toast notifications for recoverable errors
     - Error state display for critical failures
   - Add automatic retry logic:
     - WebSocket reconnection with backoff
     - API call retries with timeout
     - Audio processing fallbacks
   - Create error recovery strategies:
     - Cache messages locally to prevent data loss
     - Session recovery from localStorage on page refresh
     - Graceful degradation when audio features unavailable

**Deliverables:**
- Complete end-to-end conversation flow through WebSocket
- Unified state management between components
- Robust error handling with recovery strategies
- Session persistence with cross-component state management

## Technical Specifications

- **Audio Format:** WAV
- **Persistence:** localStorage
- **Thinking State:** 2-second simulation
- **Typing Animation:** Using existing library with best practices
- **Backend Communication:** Both REST API and WebSocket

## Testing Strategy

1. **Unit Testing:**
   - Test hooks in isolation
   - Verify state transitions
   - Validate storage functionality

2. **Integration Testing:**
   - Test complete conversation flow
   - Verify visualization responds to audio input
   - Ensure proper state handling

3. **Edge Cases:**
   - Test microphone permission denial
   - Test page refresh during conversation
   - Test handling of long responses

## Future Considerations (Post Phase 4)

- Authentication and user profile implementation
- Network error handling and recovery
- Voice activity detection
- Session pause/resume functionality
- Interruption handling during AI responses
- Adaptive conversation prompts

## Important Design Update

**Note: Design Change (Post Phase 4)**

After implementing and testing the WebSocket-based approach described in this plan, we've made the strategic decision to switch to a REST API architecture for the following reasons:

1. Simpler interaction model that better fits our request-response pattern
2. More predictable state management with clearer transitions
3. Reduced complexity without race conditions in WebSocket messaging
4. Easier debugging, maintenance, and error handling
5. Better alignment with typical backend architectures

This design change is documented in detail in the PHASE5_DEVELOPMENT_PLAN.md file, which outlines the REST API implementation path forward. 