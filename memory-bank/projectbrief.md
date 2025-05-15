# Project Brief: Kuku Coach

## 1. Project Name
Kuku Coach

## 2. Project Goal
To develop a highly interactive and user-friendly AI voice coaching assistant that operates seamlessly on web and mobile browsers. The application will facilitate voice-based coaching sessions between a user and an AI, manage session progression, and provide summaries of coaching interactions.

## 3. Core Functionality

*   **User Authentication/Guest Access:** Guest access for now, with authentication planned for future phases.
*   **Session Initiation:** User can start a new coaching session from the landing page.
*   **Voice Interaction:**
    *   User can record voice input through the browser's microphone.
    *   Frontend analyzes audio in real-time for visual feedback.
    *   Frontend sends recorded audio to a mock backend service.
    *   Mock backend processes the audio and returns an AI-generated response.
    *   Frontend plays the AI's voice response and displays the text with typing animation.
*   **Visual Feedback:** 
    *   Display a multi-layered voice waveform visualization during user speaking.
    *   Show different visualization states during AI response playback.
    *   Provide clear visual indicators for recording, thinking, and responding states.
*   **Session Management:** 
    *   Track the current session state and conversation history.
    *   Persist conversations in browser storage for resilience.
    *   Provide real-time updates via WebSocket connection.
*   **Session Termination:** User or AI can end the session with appropriate closing dialogue.
*   **Session Summary:** Upon session completion, display a summary of the conversation and allow the user to rate their experience.
*   **Navigation:** Clear navigation between the start screen, active session screen, and summary screen using React Router.

## 4. Target Audience
Individuals seeking personal development, coaching, or a guided conversational AI experience.

## 5. Key Success Metrics

*   **User Engagement:** Average session duration, number of interactions per session, visualization responsiveness.
*   **Task Completion Rate:** Users successfully completing a coaching session and viewing a summary.
*   **User Satisfaction:** Ratings provided on the summary screen.
*   **Technical Performance:** Audio recording quality, response time, animation smoothness.
*   **Visual Appeal:** Attractiveness of the UI, particularly the voice visualization.

## 6. Current Implementation Phase

The project is being implemented in multiple phases:
1. ✓ UI Scaffolding & Basic Routing
2. ✓ Start Screen Implementation
3. ✓ Active Session & Summary Screens
4. 🔄 Core Voice Interaction Logic
5. ◯ Refinements, Styling, and Testing

Currently, we are working on Phase 4, implementing the core voice interaction logic and connecting the UI components to the mock backend services. 