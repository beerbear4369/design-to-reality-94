# System Patterns and Architecture

## Core Architectural Patterns

### Component Architecture
- **Atomic Design Pattern**: Breaking down UI into atoms, molecules, organisms, templates, and pages
- **Component-Based Architecture**: Each UI element is a reusable React component
- **Container/Presentational Pattern**: Separating logic from presentation concerns

### Data Flow
- **Context API for Global State**: SessionContext maintains global conversation state
- **Unidirectional Data Flow**: State flows down, events bubble up
- **Custom Hooks for Reusable Logic**: Encapsulating complex logic like audio handling in custom hooks

### Audio Processing Pipeline
```mermaid
flowchart TD
    subgraph User Input
        MIC[Microphone Input] --> MST[MediaStream]
        MST --> MR[MediaRecorder]
        MR --> BLOB[Audio Blob]
    end

    subgraph Analysis
        MST --> MSRC[MediaStreamSource]
        MSRC --> ANLZ[AnalyserNode]
        ANLZ --> FREQ[Frequency Data]
        FREQ --> VIZ[Visualization]
    end

    subgraph Backend Integration
        BLOB --> SEND[Send to Backend]
        SEND --> |Process| RESP[AI Response]
        RESP --> TXT[Text]
        RESP --> AUD[Audio URL]
    end

    subgraph Playback
        AUD --> AELEM[Audio Element]
        AELEM --> PLBK[Audio Playback]
        AELEM --> ASRC[AudioElementSource]
        ASRC --> ANLZ2[AnalyserNode]
        ANLZ2 --> FREQ2[Frequency Data]
        FREQ2 --> VIZ
    end

    TXT --> MSG[Display Message]
```

## Key Design Patterns

### State Management
- **React Context API**: For global application state
- **useState**: For component-local state
- **useRef**: For maintaining references across renders
- **localStorage**: For persisting session data between page reloads

### Audio Processing Pattern
- **Web Audio API**: For real-time audio processing and analysis
- **Unified Analyzer Approach**: Same visualization logic for both record and playback
- **Frequency Band Analysis**: Splitting audio spectrum for more detailed visualization
- **Resource Lifecycle Management**: Careful tracking and cleanup of audio resources

### Asynchronous Patterns
- **Promise-based API interactions**: For audio processing and backend communication
- **React useEffect for Side Effects**: Managing audio lifecycle and playback
- **Exponential Backoff for Retries**: When handling potentially failing audio operations

### Error Handling Pattern
- **Try/Catch in Async Functions**: For capturing and handling errors
- **Fallback Mechanisms**: Providing alternatives when primary methods fail
- **Error Propagation**: Bubbling errors up to UI for user feedback

## Component Hierarchy

```mermaid
flowchart TD
    subgraph App
        RC[Root Component]
    end

    subgraph Pages
        KC[KukuCoach Page]
    end

    subgraph Components
        RB[RecordingButton]
        VV[VoiceVisualization]
        AM[AIMessage]
        TI[ThinkingIndicator]
    end

    subgraph Hooks
        UAR[useAudioRecorder]
        UAL[useAudioLevel]
        US[useSession]
    end

    subgraph Services
        AG[audio-generator]
        MB[mock/backend]
    end

    RC --> KC
    KC --> RB
    KC --> VV
    KC --> AM
    KC --> TI
    KC --> UAR
    KC --> UAL
    KC --> US
    UAL --> VV
    US --> MB
    US --> AG
```

## Data Flow Architecture

### Conversation Flow
```mermaid
flowchart LR
    IDLE[Idle State] -->|User clicks| REC[Recording]
    REC -->|User stops| PROC[Processing]
    PROC -->|Send to backend| RESP[Responding]
    RESP -->|Audio finishes| IDLE
```

### Audio Visualization Flow
```mermaid
flowchart TD
    MIC[Microphone Input] -->|During recording| ANLZ1[Audio Analysis]
    AUD[Audio Element] -->|During playback| ANLZ2[Audio Analysis]
    ANLZ1 -->|Same processing| FREQ[Frequency Data]
    ANLZ2 -->|Same processing| FREQ
    FREQ --> VIZ[Visualization Render]
```