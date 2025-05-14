# Kuku Coach Frontend - Development Plan

## Assumptions for Planning:

*   **Routing:** We'll use React Router for three main screens: `/` (Start), `/session` (Active Coaching), and `/summary` (Session Summary).
*   **State Management:** We'll start with React Context API for managing application state (e.g., current screen, session ID, conversation messages, recording status). If complexity grows significantly, we can consider a dedicated library like Zustand.
*   **API Interaction (Placeholders):**
    *   **Start Session:** `POST /api/session/start` (Payload: e.g., user preferences if any) -> Returns: `{ sessionId: "unique-session-id" }`.
    *   **Send User Voice:** `POST /api/session/{sessionId}/audio` (Payload: audio file e.g., MP3 in FormData) -> Returns: `{ aiResponseText: "...", aiAudioUrl: "..." }`.
    *   **End Session & Get Summary:** `POST /api/session/{sessionId}/end` (or a specific API like `GET /api/session/{sessionId}/summary`) -> Returns: `{ summaryText: "...", coachingExperienceRating: null }`.
*   **Audio Handling:** We'll use the browser's `MediaRecorder` API for recording and standard HTML5 audio elements for playback.
*   **UI Components:** Continue leveraging Shadcn/UI and Tailwind CSS.
*   **"View Session History":** This will be a placeholder initially and can be implemented in a later phase.

---

## Development Plan: Kuku Coach Frontend

**Phase 0: Project Review & Memory Bank Initialization (Ongoing)**

*   **Task:** Briefly review the current setup (Vite, React, TypeScript, Shadcn/UI, routing, existing `kuku-coach` components).
*   **Memory Bank:**
    *   Create/Update `projectbrief.md`: Define the overall goal of Kuku Coach.
    *   Create/Update `productContext.md`: Detail the user experience, problem it solves (AI coaching).
    *   Create/Update `techContext.md`: Document the tech stack (Vite, React, TS, Shadcn, Tailwind).
    *   Create/Update `systemPatterns.md`: Initial thoughts on component structure and data flow.
    *   Create `activeContext.md`: Set the current focus on initial planning and UI scaffolding.
    *   Create `progress.md`: Mark initial setup as complete, planning phase in progress.

**Phase 1: UI Scaffolding & Basic Routing**

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

**Phase 2: Implementing the Start Screen**

*   **Goal:** Build the UI for the "Start Session" screen as per the image.
*   **Tasks:**
    1.  In `StartSessionPage.tsx`:
        *   Add "Kuku Coach" title.
        *   Add "Your AI Coaching Assistant" subtitle.
        *   Add a "Start Session" button (using Shadcn/UI `Button`).
    2.  Implement navigation: Clicking "Start Session" should:
        *   (Placeholder) Make an API call to the backend to initiate a session (e.g., `POST /api/session/start`).
        *   Store the `sessionId` (from API response) in a global state (React Context).
        *   Navigate the user to the `ActiveSessionPage` (e.g., `/session/THE_NEW_SESSION_ID`).
*   **Memory Bank:** Update `activeContext.md` and `progress.md`. Document UI components in `systemPatterns.md`.

**Phase 3: Implementing the Active Session Screen - UI & Initial State**

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

**Phase 4: Core Voice Interaction Logic**

*   **Goal:** Implement the record, send, receive, and play audio functionality.
*   **Tasks (within `ActiveSessionPage.tsx` and related components/hooks):**
    1.  **Recording:**
        *   On clicking the record button: Start audio recording using `MediaRecorder`.
        *   Update UI to indicate recording is active (e.g., button state, visualization changes).
        *   On stopping recording (e.g., clicking again or after a pause): Get the recorded audio data (e.g., as a Blob).
    2.  **Sending Audio:**
        *   Convert audio blob to a suitable format if needed (e.g., MP3 - might require a library, or send raw format if backend supports it).
        *   Send the audio file to the backend API (e.g., `POST /api/session/{sessionId}/audio`).
        *   Update UI to show "processing" or "waiting for AI response".
    3.  **Receiving & Displaying AI Response:**
        *   On successful API response:
            *   Receive the AI's text reply and the URL to its audio response.
            *   Display the AI's text reply on the screen (e.g., append to a chat-like interface or update a dedicated area).
            *   Automatically play the AI's audio response using an HTML audio element.
            *   Update the voice visualization if it's meant to react to AI speech too.
    4.  **Conversation Loop:** Allow the user to record and send another message after the AI responds.
*   **Memory Bank:** Update `activeContext.md`, `progress.md`. Document voice interaction flow and API details in `systemPatterns.md` and `techContext.md`.

**Phase 5: Implementing the Session Summary Screen**

*   **Goal:** Build the UI and basic functionality for the session summary screen.
*   **Tasks:**
    1.  In `SessionSummaryPage.tsx`:
        *   Display "Session Summary" title.
        *   Display the coaching session focus text (received from backend API, e.g., `GET /api/session/{sessionId}/summary`).
        *   Display "How was your coaching experience?"
        *   Add a star rating component (Shadcn/UI doesn't have one by default, might need a custom component or simple static stars for now).
        *   Add a "Start New Session" button. Clicking this should navigate the user back to the `StartSessionPage` (`/`).
        *   Add a "View Session History" button (this will be a placeholder for now, no action).
    2.  Implement navigation: When the backend signals the session end (or user explicitly ends it via UI if that's a feature), navigate to this `SessionSummaryPage`.
*   **Memory Bank:** Update `activeContext.md`, `progress.md`.

**Phase 6: State Management & Full API Integration**

*   **Goal:** Solidify state management and replace all placeholder API calls with actual integrations.
*   **Tasks:**
    1.  Refine React Context or implement a more robust state management solution (if needed) to handle:
        *   Current session ID.
        *   Conversation history (user messages, AI responses).
        *   Recording status, loading states for API calls.
        *   Session summary data.
    2.  Replace all placeholder API calls with actual `fetch` or `axios` (if installed) requests to your defined backend endpoints.
    3.  Implement proper loading indicators for all API interactions.
    4.  Implement robust error handling for API calls (displaying user-friendly messages).
*   **Memory Bank:** Update all relevant files, especially `systemPatterns.md` with final API contracts and `techContext.md` if new libraries are added. `progress.md` reflects full feature implementation.

**Phase 7: Refinements, Styling, and Testing**

*   **Goal:** Polish the application, ensure it matches the design, and test thoroughly.
*   **Tasks:**
    1.  Fine-tune all styling to closely match the provided image (colors, fonts, spacing, layout).
    2.  Ensure responsiveness if the app is intended for different screen sizes (mobile focus noted).
    3.  Test all user flows and interactions.
    4.  Address any bugs or edge cases found.
    5.  Consider accessibility improvements.
*   **Memory Bank:** Final review and update of all Memory Bank documents to reflect the completed state. Update `progress.md` to "Completed" or list known issues/future enhancements. 