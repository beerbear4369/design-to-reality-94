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

**Objective:** Implement audio recording functionality with real-time analysis for visualization.

**Tasks:**
1. **Audio Recording Hook**
   - Create `src/hooks/useAudioRecorder.ts` with:
     - Microphone access and permission handling
     - MediaRecorder implementation for WAV capture
     - Start/stop recording functionality
     - Error handling for permission issues

2. **Audio Analysis**
   - Add real-time audio analysis to `useAudioRecorder`:
     - Create AudioContext and analyzer nodes
     - Extract amplitude data for visualization
     - Calculate frequency distribution (low/mid/high)
     - Return audio level metrics in hook

3. **Voice Visualization Enhancement**
   - Modify existing visualization component:
     - Connect to real-time audio metrics
     - Add different colors for AI response state
     - Ensure responsive animation to audio input

4. **Recording Button Enhancement**
   - Update recording button component:
     - Connect to useAudioRecorder hook
     - Add visual feedback for recording states
     - Implement smooth transitions between states

**Deliverables:**
- Functional audio recording with WAV output
- Real-time audio visualization based on microphone input
- Visual indicators for recording state
- Proper error handling for permissions

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
     - Handle WebSocket connection lifecycle
     - Manage event subscription and emission
     - Reconnection logic and error handling
   - Connect to audio recording for real-time transmission

2. **Session Management**
   - Implement `useConversation` hook:
     - Start new sessions via API
     - Handle message exchange
     - Manage conversation termination
     - Enable session recovery on page refresh

3. **Full Conversation Flow**
   - Connect recording button to WebSocket events
   - Link audio recording to real-time transmission
   - Connect AI responses to message display
   - Implement session summary generation

4. **Error Handling**
   - Add error handling for:
     - Microphone access issues
     - WebSocket connection problems
     - API failures
     - Audio processing errors

**Deliverables:**
- Complete end-to-end conversation flow
- Seamless transitions between all states
- Session persistence across page refreshes
- Robust error handling and recovery

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
- Transition to real backend services 