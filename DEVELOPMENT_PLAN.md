# Kuku Coach Frontend - Development Plan

## Assumptions for Planning:

*   **Routing:** We'll use React Router for three main screens: `/` (Start), `/session` (Active Coaching), and `/summary` (Session Summary).
*   **State Management:** We'll start with React Context API for managing application state (e.g., current screen, session ID, conversation messages, recording status). If complexity grows significantly, we can consider a dedicated library like Zustand.
*   **API Interaction:**
    *   **Create Session:** `POST /api/sessions/create` -> Returns: `{ sessionId: "unique-session-id" }`.
    *   **Send User Voice:** `POST /api/sessions/{sessionId}/audio` (Payload: audio file blob in FormData) -> Returns: `{ messageId: "msg-123", text: "AI response text", audioUrl: "url-to-audio-file" }`.
    *   **Get Conversation History:** `GET /api/sessions/{sessionId}/history` -> Returns: Array of conversation messages.
    *   **End Session & Get Summary:** `PUT /api/sessions/{sessionId}/end` -> Returns: `{ summaryText: "...", coachingExperienceRating: null }`.
*   **Audio Handling:** We'll use the browser's `MediaRecorder` API for recording and standard HTML5 audio elements for playback.
*   **UI Components:** Continue leveraging Shadcn/UI and Tailwind CSS.
*   **"View Session History":** This will be a placeholder initially and can be implemented in a later phase.

---

## Development Plan: Kuku Coach Frontend

**Phase 0: Project Review & Memory Bank Initialization (Completed)**

*   **Task:** Briefly review the current setup (Vite, React, TypeScript, Shadcn/UI, routing, existing `kuku-coach` components).
*   **Memory Bank:**
    *   Create/Update `projectbrief.md`: Define the overall goal of Kuku Coach.
    *   Create/Update `productContext.md`: Detail the user experience, problem it solves (AI coaching).
    *   Create/Update `techContext.md`: Document the tech stack (Vite, React, TS, Shadcn, Tailwind).
    *   Create/Update `systemPatterns.md`: Initial thoughts on component structure and data flow.
    *   Create `activeContext.md`: Set the current focus on initial planning and UI scaffolding.
    *   Create `progress.md`: Mark initial setup as complete, planning phase in progress.

**Phase 1: UI Scaffolding & Basic Routing (Completed)**

*   **Goal:** Create the basic page components for each of the three main views and set up navigation.
*   **Tasks:**
    1.  Create three new page components:
        *   `src/pages/StartSessionPage.tsx` (for the initial screen)
        *   `src/pages/ActiveSessionPage.tsx` (for the main coaching interaction screen)
        *   `src/pages/SessionSummaryPage.tsx` (for the post-session summary screen)
    2.  Update `src/App.tsx` to include routes for these pages:
        *   `/` -> `StartSessionPage`
        *   `/session/:sessionId` -> `ActiveSessionPage` (or just `/session` if session ID is managed globally)
        *   `/summary/:sessionId` -> `SessionSummaryPage` (or just `/summary`)
    3.  Ensure basic navigation works between these empty/placeholder pages.
*   **Memory Bank:** Update `activeContext.md` and `progress.md`. Add routing decisions to `systemPatterns.md`.

**Phase 2: Implementing the Start Screen (Completed)**

*   **Goal:** Build the UI for the "Start Session" screen as per the image.
*   **Tasks:**
    1.  In `StartSessionPage.tsx`:
        *   Add "Kuku Coach" title.
        *   Add "Your AI Coaching Assistant" subtitle.
        *   Add a "Start Session" button (using Shadcn/UI `Button`).
    2.  Implement navigation: Clicking "Start Session" should:
        *   Make an API call to the backend to initiate a session (e.g., `POST /api/sessions/create`).
        *   Store the `sessionId` (from API response) in a global state (React Context).
        *   Navigate the user to the `ActiveSessionPage` (e.g., `/session/THE_NEW_SESSION_ID`).
*   **Memory Bank:** Update `activeContext.md` and `progress.md`. Document UI components in `systemPatterns.md`.

**Phase 3: Implementing the Active Session Screen - UI & Initial State (Completed)**

*   **Goal:** Build the static UI elements for the active coaching screen.
*   **Tasks:**
    1.  In `ActiveSessionPage.tsx`:
        *   Add "Kuku Coach" title.
        *   Add "Speak to your coach" subtitle.
        *   Integrate the existing `voice-visualization.tsx` (or a new one to match the image better) for the central waveform display.
        *   Display an initial message from the AI: "I'm here to help you with your goals. What would you like to discuss today?" (This can be a static message initially or part of the session start response).
        *   Add the recording button (using `recording-button.tsx` or a new one if needed to match the image's circular design with a stop icon).
    2.  Style all elements according to the design.
*   **Memory Bank:** Update `activeContext.md`, `progress.md`.

**Phase 4: Core Voice Interaction Logic (Completed, Ready for API Transition)**

*   **Goal:** Implement the record, send, receive, and play audio functionality.
*   **Tasks (within `ActiveSessionPage.tsx` and related components/hooks):**
    1.  **Recording:**
        *   On clicking the record button: Start audio recording using `MediaRecorder`.
        *   Update UI to indicate recording is active (e.g., button state, visualization changes).
        *   On stopping recording (e.g., clicking again or after a pause): Get the recorded audio data (e.g., as a Blob).
    2.  **Sending Audio:**
        *   Convert audio blob to a suitable format if needed (e.g., MP3 - might require a library, or send raw format if backend supports it).
        *   Send the audio file to the backend API.
        *   Update UI to show "processing" or "waiting for AI response".
    3.  **Receiving & Displaying AI Response:**
        *   On successful API response:
            *   Receive the AI's text reply and the URL to its audio response.
            *   Display the AI's text reply on the screen (e.g., append to a chat-like interface or update a dedicated area).
            *   Automatically play the AI's audio response using an HTML audio element.
            *   Update the voice visualization to react to AI speech.
    4.  **Conversation Loop:** Allow the user to record and send another message after the AI responds.
*   **Memory Bank:** Update `activeContext.md`, `progress.md`. Document voice interaction flow and API details in `systemPatterns.md` and `techContext.md`.

**Phase 5: Implementing the Session Summary Screen (Completed)**

*   **Goal:** Build the UI and basic functionality for the session summary screen.
*   **Tasks:**
    1.  In `SessionSummaryPage.tsx`:
        *   Display "Session Summary" title.
        *   Display the coaching session focus text (received from backend API, e.g., `GET /api/sessions/{sessionId}/summary`).
        *   Display "How was your coaching experience?"
        *   Add a star rating component (Shadcn/UI doesn't have one by default, might need a custom component or simple static stars for now).
        *   Add a "Start New Session" button. Clicking this should navigate the user back to the `StartSessionPage` (`/`).
        *   Add a "View Session History" button (this will be a placeholder for now, no action).
    2.  Implement navigation: When the backend signals the session end (or user explicitly ends it via UI if that's a feature), navigate to this `SessionSummaryPage`.
*   **Memory Bank:** Update `activeContext.md`, `progress.md`.

**Phase 6: REST API Integration (In Progress)**

*   **Goal:** Implement REST API services to replace WebSocket communication.
*   **Tasks:**
    1.  **API Service Implementation:**
        *   Create `/services/api/session.ts` with core API methods:
            *   `createSession()`: Initialize a new conversation session
            *   `sendAudio(sessionId, audioBlob)`: Send audio and get AI response
            *   `getHistory(sessionId)`: Retrieve conversation history
            *   `endSession(sessionId)`: End current session
        *   Implement proper error handling and request/response types
    2.  **Session Management:**
        *   Update SessionContext to handle session initialization
        *   Store session ID in context and localStorage
        *   Implement history retrieval and management
    3.  **useConversation Hook Update:**
        *   Remove WebSocket-specific code
        *   Implement REST API calls for audio processing
        *   Maintain state transitions (idle → recording → processing → responding → idle)
    4.  **Component Updates:**
        *   Update RecordingButton to work with REST API approach
        *   Ensure KukuCoach component properly handles session status
        *   Maintain visualization during recording and playback
*   **Memory Bank:** Update all relevant files, especially `systemPatterns.md` with REST API details and `techContext.md`.

**Phase 7: Refinements, Testing and Production Readiness**

*   **Goal:** Polish the application, test thoroughly, and prepare for production integration.
*   **Tasks:**
    1.  **Testing:**
        *   Test full conversation flow with REST API
        *   Verify proper state transitions
        *   Test error scenarios and recovery
        *   Ensure audio visualization works during both recording and playback
    2.  **Optimization:**
        *   Optimize audio file format for faster uploads
        *   Improve loading and transition states
        *   Implement proper loading indicators
    3.  **Production Preparation:**
        *   Document API endpoints and response formats
        *   Prepare for integration with actual backend services
        *   Implement environment-specific configuration
*   **Memory Bank:** Final review and update of all Memory Bank documents to reflect the completed state. Update `progress.md` to reflect current status and next steps.

**Phase 8: Real Backend Integration**

*   **Goal:** Replace mock services with real backend APIs.
*   **Tasks:**
    1.  **API Integration:**
        *   Connect to real backend endpoints
        *   Implement authentication if required
        *   Update API service to handle production response formats
    2.  **Error Handling:**
        *   Implement robust error handling for production scenarios
        *   Add retry mechanisms for transient failures
        *   Provide user-friendly error messages
    3.  **Performance Monitoring:**
        *   Add logging for key interactions
        *   Implement analytics for user engagement metrics
        *   Set up error tracking for production issues
*   **Memory Bank:** Update technical documentation to reflect production integration. Maintain updated API specifications. 