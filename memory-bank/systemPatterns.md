# System Patterns: Kuku Coach

## 1. Application Architecture

The application follows a typical React Single Page Application (SPA) architecture with the following key patterns:

- **Component-based Structure:** UI elements are broken down into reusable components.
- **Page-level Components:** Major views of the application are organized as page components.
- **React Router:** Used for navigation between different views without full page reloads.
- **Context API:** Used for state management across components.

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
  - Recording status
  - UI state (loading indicators, etc.)
  - Session summary data

### Component Hierarchy
```
App
├── TooltipProvider, Toaster (UI utilities)
└── Routes
    ├── StartSessionPage (/)
    ├── ActiveSessionPage (/session/:sessionId)
    └── SessionSummaryPage (/summary/:sessionId)
```

### Voice Interaction Pattern
- User triggers recording → Frontend captures audio → Audio sent to backend → 
  Backend processes → AI response generated → Frontend plays response → 
  User can respond again (conversation loop)

## 3. Data Flow

### Session Initialization
- User clicks "Start Session" → API call to create session → Session ID stored in state → 
  Navigate to Active Session page

### Audio Recording & Processing
- User clicks record → MediaRecorder captures audio → Blob created on stop → 
  Blob sent to backend → Backend processes → AI response returned →
  Response displayed and played

### Session Completion
- User or AI indicates session end → Backend generates summary → 
  Frontend navigates to Summary page → Summary displayed with rating option

## 4. Component Structure

### Key Components
- **KukuCoach:** Main wrapper component
- **VoiceVisualization:** Displays audio waveform visualization
- **RecordingButton:** Handles recording state and UI
- **AIMessage:** Displays AI responses

### Planned New Components
- **SessionContext:** Global state provider
- **AudioRecorder:** Hook or component to manage MediaRecorder
- **StarRating:** For rating experience in summary screen 