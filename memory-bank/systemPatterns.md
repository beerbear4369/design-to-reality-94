# System Patterns: Kuku Coach

## 1. Application Architecture

The application follows a typical React Single Page Application (SPA) architecture with the following key patterns:

- **Component-based Structure:** UI elements are broken down into reusable components.
- **Page-level Components:** Major views of the application are organized as page components.
- **React Router:** Used for navigation between different views without full page reloads.
- **Context API:** Used for state management across components.
- **Service-oriented Backend:** Mock implementation of microservices architecture with REST and WebSocket.
- **Custom Hooks:** Encapsulation of complex logic in reusable hooks.

## 2. Key Design Patterns

### Routing Pattern
- The application uses three main routes:
  - `/` - Start Screen (Landing Page)
  - `/session/:sessionId` - Active Session Screen
  - `/summary/:sessionId` - Session Summary Screen

### State Management Pattern
- Global application state is managed using React Context API.
- Key state elements:
  - Current session ID
  - Conversation history (user and AI messages)
  - Recording status and audio levels
  - UI state (loading, thinking, responding indicators)
  - Session summary data

### Component Hierarchy
```
App
├── TooltipProvider, Toaster (UI utilities)
└── Routes
    ├── StartSessionPage (/)
    ├── ActiveSessionPage (/session/:sessionId)
    │   ├── KukuCoach
    │   │   ├── VoiceVisualization
    │   │   ├── RecordingButton
    │   │   ├── AIMessage
    │   │   └── ThinkingIndicator
    │   └── WebSocket Connection Manager
    └── SessionSummaryPage (/summary/:sessionId)
        ├── SummaryText
        ├── StarRating
        └── ActionButtons
```

### Backend Service Pattern (Implemented)
```
Services
├── API
│   ├── Conversation API (conversation.ts)
│   │   ├── createSession() - Creates a new coaching session
│   │   ├── getConversation() - Gets conversation by ID
│   │   ├── getAllConversations() - Lists all conversations
│   │   ├── updateConversation() - Updates an existing conversation
│   │   ├── endSession() - Ends session and generates summary
│   │   └── deleteConversation() - Deletes a conversation
│   └── Audio API (audio.ts)
│       ├── transcribeAudio() - Converts audio to text
│       └── synthesizeSpeech() - Generates AI voice response
├── WebSocket (websocket/index.ts)
│   ├── Client Events
│   │   ├── client:start-recording - User starts recording
│   │   ├── client:audio-data - Streaming audio data
│   │   └── client:stop-recording - User stops recording
│   └── Server Events
│       ├── server:recording-started - Recording acknowledged
│       ├── server:thinking - AI processing indicator
│       ├── server:response - Text response from AI
│       └── server:audio-response - Audio response URL
└── Storage (storage/index.ts)
    ├── saveConversation() - Persists conversation to localStorage
    ├── getConversation() - Retrieves conversation by ID
    ├── getAllConversations() - Gets all stored conversations
    ├── deleteConversation() - Removes a conversation
    └── clearAllConversations() - Removes all conversations
```

### Audio Recording Pattern
The audio recording logic follows a specific pattern:
1. **Hook-based abstraction:** `useAudioRecorder` encapsulates all recording logic
2. **State management:**
   - Track recording state (not recording → recording → processing)
   - Manage resources (MediaRecorder, MediaStream)
   - Handle errors and edge cases
3. **Lifecycle management:**
   - Setup (get permissions, create recorder)
   - Recording (capture audio chunks)
   - Processing (combine chunks into blob)
   - Cleanup (release resources)
4. **Error handling:**
   - Permission errors
   - Recording failures
   - Processing issues
   - Fallback mechanisms
5. **Integration with UI:**
   - Provide visual feedback during recording
   - Show processing state
   - Display errors when they occur

### Voice Interaction Pattern
1. User triggers recording → 
2. Frontend captures audio with MediaRecorder → 
3. Real-time audio analysis updates visualization → 
4. WebSocket sends audio data chunks → 
5. On recording end, backend enters "thinking" state → 
6. AI response generated (mocked with predefined responses) → 
7. Text response returned and displayed with typing animation → 
8. Audio response URL provided for playback → 
9. Conversation continues (loop to step 1)

## 3. Data Flow

### Session Initialization
1. User clicks "Start Session" → 
2. createSession() API call creates session → 
3. Session ID stored in state → 
4. WebSocket connection established → 
5. Navigate to Active Session page with sessionId in URL

### Audio Recording & Processing
1. User clicks record button → 
2. startRecording() called from useAudioRecorder hook →
3. MediaRecorder API captures microphone input → 
4. WebAudioAPI analyzes audio for visualization → 
5. On stop recording:
   - For testing: Generate and download audio file
   - For production: Send audio blob to backend via WebSocket → 
6. Backend triggers "thinking" state (with 2-second delay in mock) → 
7. AI response generated with both text and audio URL → 
8. Response played through audio element and displayed with typing effect

### Session Completion
1. User or AI indicates session end → 
2. endSession() API call generates summary → 
3. Frontend navigates to Summary page → 
4. Summary displayed with rating option → 
5. User can rate session and start a new one

### Persistence Flow
1. Conversation stored in localStorage after each message → 
2. Retrieved on page refresh or session restore → 
3. Maintained in memory during active session → 
4. Updated with each message exchange → 
5. Deleted when explicitly removed by user

## 4. Component Structure

### Key Components
- **KukuCoach:** Main wrapper component for the coaching interface
- **VoiceVisualization:** Displays audio waveform visualization with four distinct wave patterns
- **RecordingButton:** Handles recording state and UI, changes appearance based on recording state
- **AIMessage:** Displays AI responses with typing animation and glass effect styling
- **ThinkingIndicator:** Shows "Kuku is thinking" state while AI generates a response

### Key Hooks
- **useAudioRecorder:** Manages microphone access, recording, and real-time audio analysis
  - Provides recording lifecycle control (start, stop, save)
  - Handles errors and recovery mechanisms
  - Manages resource cleanup to prevent memory leaks
- **useAudioLevel:** Processes audio data for visualization
- **useConversation:** Manages conversation state and history, integrates with storage
- **useWebSocket:** Handles WebSocket connection and event management
- **useThinking:** Manages the AI "thinking" state during response generation

### Backend Service Implementation
- **services/api/index.ts:** Central API configuration and endpoints export
- **services/api/conversation.ts:** Session and conversation management
- **services/api/audio.ts:** Audio transcription and speech synthesis
- **services/websocket/index.ts:** WebSocket connection and event handling
- **services/websocket/events.ts:** Event types and interfaces
- **services/storage/index.ts:** LocalStorage persistence for conversations
- **services/mock/responses.ts:** Predefined AI responses for different conversation states

### Data Models
```typescript
// Conversation Model
interface Conversation {
  id: string;
  startedAt: string;
  lastUpdatedAt: string;
  endedAt?: string;
  messages: Message[];
  summary?: string;
  userRating?: number;
}

// Message Model
interface Message {
  id: string;
  timestamp: string;
  sender: 'user' | 'ai';
  text: string;
  audioUrl?: string;
}

// Audio Recording Models
interface UseAudioRecorderResult {
  audioBlob: Blob | null;
  isRecording: boolean;
  error: string | null;
  recordingDuration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  saveRecording: (filename?: string) => void;
}
```

### UI State Management
- **Recording State:** Not recording → Recording → Processing → AI Speaking → Not recording
- **Message Flow:** User Message → AI Thinking → AI Response → User Message (loop)
- **Session Flow:** Start Screen → Active Session → Summary Screen → Start Screen