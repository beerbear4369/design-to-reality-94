# System Patterns: Kuku Coach

## 1. Application Architecture

The application follows a typical React Single Page Application (SPA) architecture with the following key patterns:

- **Component-based Structure:** UI elements are broken down into reusable components.
- **Page-level Components:** Major views of the application are organized as page components.
- **React Router:** Used for navigation between different views without full page reloads.
- **Context API:** Used for state management across components.
- **Service-oriented Backend:** Mock implementation of microservices architecture with REST and WebSocket.

## 2. Key Design Patterns

### Routing Pattern
- The application will use three main routes:
  - `/` - Start Screen (Landing Page)
  - `/session/:sessionId` - Active Session Screen
  - `/summary/:sessionId` - Session Summary Screen

### State Management Pattern
- Global application state will be managed using React Context API.
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
    │   │   └── ThinkingIndicator (new)
    │   └── WebSocket Connection Manager
    └── SessionSummaryPage (/summary/:sessionId)
```

### Backend Service Pattern (Mock Implementation)
```
Services
├── API Gateway
│   ├── Conversation Endpoints
│   │   ├── Create Session
│   │   ├── Get Conversation
│   │   └── End Session
│   └── Audio Endpoints
│       ├── Transcribe Audio
│       └── Synthesize Speech
├── WebSocket Server
│   ├── Client Events
│   │   ├── start-recording
│   │   ├── audio-data
│   │   └── stop-recording
│   └── Server Events
│       ├── thinking
│       ├── response
│       └── audio-response
└── Storage Service
    └── LocalStorage Persistence
```

### Voice Interaction Pattern
- User triggers recording → Frontend captures audio → Audio processed for visualization →
  Audio data sent via WebSocket → Backend processes (simulated) → 
  Thinking state displayed → AI response generated → 
  Typed response animation shown → Audio response played →
  User can respond again (conversation loop)

## 3. Data Flow

### Session Initialization
- User clicks "Start Session" → REST API call to create session → Session ID stored in state → 
  WebSocket connection established → Navigate to Active Session page

### Audio Recording & Processing
- User clicks record → MediaRecorder captures audio → Real-time analysis for visualization →
  WebSocket sends audio data → Backend acknowledges (mock) →
  On recording stop → Backend enters thinking state → AI response generated →
  Response returned via WebSocket → Response displayed with typing animation →
  Audio response played through browser

### Session Completion
- User or AI indicates session end → REST API call to end session → 
  Backend generates summary → Frontend navigates to Summary page → 
  Summary displayed with rating option

### Persistence Flow
- Conversation history stored in localStorage →
  Retrieved on page refresh or session restore →
  Maintained in memory during active session →
  Updated with each message exchange

## 4. Component Structure

### Key Components
- **KukuCoach:** Main wrapper component
- **VoiceVisualization:** Displays audio waveform visualization
- **RecordingButton:** Handles recording state and UI
- **AIMessage:** Displays AI responses with typing animation
- **ThinkingIndicator:** Shows "Kuku is thinking" state

### Key Hooks
- **useAudioRecorder:** Manages microphone access, recording, and real-time audio analysis
- **useConversation:** Manages conversation state and history
- **useWebSocket:** Handles WebSocket connection and events

### Backend Service Structure
- **api/index.ts:** Central API configuration and routing
- **api/conversation.ts:** Session and conversation management endpoints
- **api/audio.ts:** Audio processing and transcription endpoints
- **websocket/index.ts:** WebSocket connection management
- **websocket/events.ts:** Event handlers and emission logic
- **storage/index.ts:** LocalStorage wrapper for persistence
- **mock/responses.ts:** Simulated AI responses and logic

### Planned New Components
- **SessionContext:** Global state provider
- **AudioRecorder:** Hook or component to manage MediaRecorder
- **StarRating:** For rating experience in summary screen 