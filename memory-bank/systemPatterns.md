# System Patterns and Architecture

## Core Architectural Patterns

### Component Architecture
- **Atomic Design Pattern**: Breaking down UI into atoms, molecules, organisms, templates, and pages
- **Component-Based Architecture**: Each UI element is a reusable React component
- **Container/Presentational Pattern**: Separating logic from presentation concerns

### Data Flow
- **Context API for Global State**: SessionContext maintains global session state (not conversation history)
- **Custom Hooks for State Management**: useConversation maintains conversation state
- **Unidirectional Data Flow**: State flows down, events bubble up
- **Custom Hooks for Reusable Logic**: Encapsulating complex logic like audio handling in custom hooks

### Backend Communication Pattern
- **REST API with Session-Based Design**: REST API approach with clear separation from UI state
- **Session Initialization**: Create session before starting conversation
- **Audio Message Exchange**: Send audio with session context, receive text and audio responses
- **Conversation History**: Retrieve history based on session ID
- **Session Rating**: Submit and retrieve session ratings with automatic persistence
- **Separation of Concerns**: UI state separate from backend communication

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
        BLOB --> API[REST API Call]
        API --> |Process| RESP[AI Response]
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

### Rating System Pattern
```mermaid
flowchart TD
    subgraph Session Completion
        END[Session Ends] --> SUMMARY[Summary Page]
        SUMMARY --> RATING[Rating Component]
    end

    subgraph Rating Flow
        RATING --> LOAD[Load Existing Rating]
        LOAD --> DISPLAY[Display Stars]
        DISPLAY --> USER[User Clicks Star]
        USER --> SAVE[Auto-Save to Backend]
        SAVE --> CONFIRM[Show Confirmation]
    end

    subgraph Backend Integration
        SAVE --> API[Rating API]
        API --> DB[Supabase Database]
        DB --> PERSIST[Rating Persisted]
    end
```

### Complete Session Lifecycle Pattern
```mermaid
flowchart TD
    subgraph Session Management
        CREATE[Create Session] --> INIT[Initialize Context]
        INIT --> CONV[Conversation Loop]
        CONV --> |Auto/Manual| END[End Session]
        END --> SUMMARY[Generate Summary]
        SUMMARY --> RATE[Collect Rating]
        RATE --> PERSIST[Persist Session Data]
    end

    subgraph Conversation Loop
        IDLE[Idle State] --> RECORD[Recording Audio]
        RECORD --> PROCESS[Processing Audio]
        PROCESS --> RESPOND[AI Response]
        RESPOND --> |Continue| IDLE
        RESPOND --> |Wrap Up| END
    end

    subgraph Data Persistence
        PERSIST --> SESSIONS[Sessions Table]
        PERSIST --> MESSAGES[Messages Table]
        SESSIONS --> ANALYTICS[Session Analytics]
        MESSAGES --> HISTORY[Conversation History]
    end
```

## Key Design Patterns

### State Management
- **React Context API**: For global session state (status, ID)
- **Custom Hooks**: For conversation state management
- **useState**: For component-local state
- **useRef**: For maintaining references across renders
- **localStorage**: For persisting session data between page reloads

### Session Management
- **Session Initialization**: Create session ID at startup
- **Session Context**: Maintain session ID across interactions
- **Session Persistence**: Store session ID in localStorage
- **History Retrieval**: Fetch conversation history by session ID
- **Rating Management**: Auto-load and auto-save session ratings
- **Clear Separation**: Session UI state separate from conversation data

### Rating Management Pattern
- **Auto-Loading**: Load existing ratings on component mount
- **Auto-Saving**: Immediate persistence when user interacts
- **Optimistic Updates**: Update UI immediately, handle errors gracefully
- **Error Recovery**: Reset state on failure, provide user feedback
- **Type Safety**: Full TypeScript interfaces for rating data structures
- **Backend Validation**: Server-side validation of rating values (1-5 scale)
- **Session State Validation**: Only ended sessions can be rated

### Audio Processing Pattern
- **Web Audio API**: For real-time audio processing and analysis
- **Unified Analyzer Approach**: Same visualization logic for both record and playback
- **Frequency Band Analysis**: Splitting audio spectrum for more detailed visualization
- **Resource Lifecycle Management**: Careful tracking and cleanup of audio resources

### Asynchronous Patterns
- **Promise-based API interactions**: For audio processing and backend communication
- **React useEffect for Side Effects**: Managing audio lifecycle and playback
- **Exponential Backoff for Retries**: When handling potentially failing audio operations
- **Concurrent State Management**: Managing multiple async operations (rating, conversation)

### Error Handling Pattern
- **Try/Catch in Async Functions**: For capturing and handling errors
- **Fallback Mechanisms**: Providing alternatives when primary methods fail
- **Error Propagation**: Bubbling errors up to UI for user feedback
- **Graceful Degradation**: Continuing core functionality when secondary features fail
- **Database Resilience**: Continue operation when database unavailable

### Database Synchronization Pattern
```mermaid
flowchart TD
    subgraph Memory Operations
        MEMORY[In-Memory State] --> UPDATE[State Update]
        UPDATE --> SYNC[Sync to Database]
    end

    subgraph Database Operations
        SYNC --> VALIDATE[Validate Data]
        VALIDATE --> PERSIST[Persist to Supabase]
        PERSIST --> CONFIRM[Confirm Success]
    end

    subgraph Error Handling
        PERSIST --> |Failure| ROLLBACK[Rollback Memory State]
        ROLLBACK --> RETRY[Retry Logic]
        RETRY --> |Success| CONFIRM
        RETRY --> |Failure| ERROR[Error State]
    end
```

## Component Hierarchy

```mermaid
flowchart TD
    subgraph App
        RC[Root Component]
    end

    subgraph Pages
        KC[KukuCoach Page]
        SP[SessionSummary Page]
        HP[SessionHistory Page]
    end

    subgraph Components
        RB[RecordingButton]
        VV[VoiceVisualization]
        AM[AIMessage]
        TI[ThinkingIndicator]
        RT[Rating Component]
        SR[StarRating]
    end

    subgraph Hooks
        UAR[useAudioRecorder]
        UAL[useAudioLevel]
        US[useSession]
        UC[useConversation]
        UR[useRating]
    end

    subgraph Services
        AG[audio-generator]
        API[api-service]
        RS[rating-service]
        DB[database-service]
    end

    RC --> KC
    RC --> SP
    RC --> HP
    KC --> RB
    KC --> VV
    KC --> AM
    KC --> TI
    SP --> RT
    RT --> SR
    KC --> UC
    UC --> UAR
    UC --> UAL
    UC --> US
    UC --> API
    RT --> RS
    UAL --> VV
    US --> API
    US --> AG
    RS --> DB
```

## Complete System Architecture

```mermaid
flowchart TD
    subgraph UI Layer
        KC[KukuCoach]
        RB[RecordingButton]
        VV[VoiceVisualization]
        RT[Rating Component]
        SP[SessionSummary]
        HP[SessionHistory]
    end
    
    subgraph State Management Layer
        SC[SessionContext] --> SS[Session State]
        UC[useConversation Hook] --> MS[Message State]
        RC[Rating State] --> RS[Rating Management]
        SC <-- Status Updates --> UC
    end
    
    subgraph Service Layer
        API[Session API]
        AG[Audio Generator]
        RATING[Rating Service]
        HISTORY[History Service]
    end

    subgraph Backend Layer
        REST[REST API Endpoints]
        AUDIO[Audio Processing]
        AI[AI Response Generation]
        DB[Supabase Database]
    end
    
    KC --> RB
    KC --> VV
    KC --> UC
    SP --> RT
    HP --> HISTORY
    RT --> RC
    RB --> UC
    UC --> API
    RC --> RATING
    API --> REST
    RATING --> REST
    HISTORY --> REST
    REST --> AUDIO
    REST --> AI
    REST --> DB
```

## Data Flow Architecture

### Complete Session Flow
```mermaid
flowchart LR
    subgraph Session Lifecycle
        INIT[Initialize Session] -->|Create Session ID| READY[Ready State]
        READY -->|Conversation| ACTIVE[Active Session]
        ACTIVE -->|Auto/Manual End| SUMMARY[Session Summary]
        SUMMARY -->|Rate Session| RATING[Rating Collection]
        RATING -->|Complete| HISTORY[Session History]
    end
    
    subgraph Conversation Flow
        IDLE[Idle State] -->|User clicks| REC[Recording]
        REC -->|User stops| PROC[Processing]
        PROC -->|API Call| RESP[Responding]
        RESP -->|Audio finishes| IDLE
        RESP -->|Wrap-up trigger| SUMMARY
    end
```

### API Communication Flow
```mermaid
flowchart TD
    subgraph Session Management
        CS[Create Session] -->|POST /api/sessions| SID[Session ID]
        SID -->|Store in Context| READY[Ready State]
        READY -->|GET /api/sessions/{id}/messages| HIST[Load History]
        READY -->|POST /api/sessions/{id}/end| END[End Session]
        END -->|GET /api/sessions/{id}/rating| RATE_LOAD[Load Rating]
        RATE_LOAD -->|POST /api/sessions/{id}/rating| RATE_SAVE[Save Rating]
    end
    
    subgraph Message Exchange
        REC[Audio Recording] -->|Record Complete| BLOB[Audio Blob]
        BLOB -->|POST /api/sessions/{id}/messages| PROC[Process Audio]
        PROC -->|Backend Processing| RESP[Response]
        RESP -->|Text & Audio URL| DISP[Display & Play]
    end
```

### Rating System Flow
```mermaid
flowchart TD
    MOUNT[Component Mount] -->|sessionId| LOAD[Load Existing Rating]
    LOAD -->|GET /api/sessions/{id}/rating| CHECK[Check Rating Exists]
    CHECK -->|Rating Found| DISPLAY[Display Rating]
    CHECK -->|No Rating| EMPTY[Show Empty Stars]
    
    USER[User Clicks Star] -->|rating value| UPDATE[Update UI State]
    UPDATE -->|POST /api/sessions/{id}/rating| SAVE[Save to Backend]
    SAVE -->|Success| SUCCESS[Show Success Message]
    SAVE -->|Error| ERROR[Reset Rating & Show Error]
    
    SUCCESS -->|Edit Rating| USER
```

### Audio Visualization Flow
```mermaid
flowchart TD
    MIC[Microphone Input] -->|During recording| ANLZ1[Audio Analysis]
    AUD[Audio Element] -->|During playback| ANLZ2[Audio Analysis]
    ANLZ1 -->|Same processing| FREQ[Frequency Data]
    ANLZ2 -->|Same processing| FREQ
    FREQ --> VIZ[Visualization Render]
    VIZ --> |Real-time updates| UI[User Interface]
```

### Database Persistence Flow
```mermaid
flowchart TD
    subgraph Session Data
        CREATE[Session Created] --> SESSION_DB[Sessions Table]
        MESSAGES[Message Exchange] --> MESSAGE_DB[Messages Table]
        RATING[Rating Submitted] --> |Update| SESSION_DB
        END_SESSION[Session Ended] --> |Update| SESSION_DB
    end

    subgraph Synchronization
        MEMORY[In-Memory State] --> |Real-time sync| SESSION_DB
        SESSION_DB --> |Load on startup| MEMORY
        MESSAGE_DB --> |History retrieval| HISTORY_UI[History Display]
    end

    subgraph Analytics
        SESSION_DB --> STATS[Session Statistics]
        MESSAGE_DB --> CONVERSATION[Conversation Analytics]
        STATS --> DASHBOARD[Analytics Dashboard]
        CONVERSATION --> DASHBOARD
    end
```