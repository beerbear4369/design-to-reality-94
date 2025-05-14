# Product Context: Kuku Coach

## 1. Why This Project Exists
Kuku Coach aims to provide an accessible and engaging platform for AI-powered coaching. It leverages voice interaction to create a more natural and personal coaching experience, available directly in a web or mobile browser without requiring native app installations.

## 2. Problems It Solves

*   Provides on-demand coaching and conversational AI interaction.
*   Offers a user-friendly interface for users who prefer voice over text.
*   Makes AI coaching more accessible by being browser-based.

## 3. How It Should Work (User Flow)

1.  **Start Screen:** The user is greeted with an initial screen (`StartSessionPage`).
    *   Displays: "Kuku Coach", "Your AI Coaching Assistant", and a "Start Session" button.
2.  **Session Start:** Upon clicking "Start Session":
    *   The frontend initiates a new session with the backend.
    *   The user is navigated to the `ActiveSessionPage`.
3.  **Active Session Screen (`ActiveSessionPage`):
    *   Displays: "Kuku Coach" title, "Speak to your coach" subtitle.
    *   A central area shows a voice waveform visualization.
    *   An initial message from the AI is displayed (e.g., "I'm here to help you with your goals. What would you like to discuss today?").
    *   A prominent recording button is available.
4.  **User Interaction:**
    *   User clicks the record button to start speaking.
    *   The frontend captures the audio.
    *   User clicks the button again (or it auto-stops) to finish recording.
    *   The frontend sends the audio (e.g., MP3) to the backend.
5.  **AI Response:**
    *   The backend processes the audio and generates an AI response (both audio and text).
    *   The backend sends the AI's audio (e.g., URL to an MP3) and text transcription back to the frontend.
    *   The frontend plays the AI's audio response automatically.
    *   The frontend displays the AI's text reply (e.g., in a chat bubble or designated area).
    *   The voice visualization may react to the AI's speech.
6.  **Conversation Continues:** The user can then record another message, and the cycle repeats.
7.  **Session End:** When the conversation is complete (either by user indication or AI guidance):
    *   The backend may send a final message and a session summary.
    *   The frontend navigates to the `SessionSummaryPage`.
8.  **Session Summary Screen (`SessionSummaryPage`):
    *   Displays: "Session Summary" title.
    *   Shows the summary text of the coaching session.
    *   Asks "How was your coaching experience?" with a star rating system.
    *   Provides a "Start New Session" button (navigates to `StartSessionPage`).
    *   Provides a "View Session History" button (functionality for a later phase).

## 4. User Experience Goals

*   **Intuitive:** Easy to understand and use, especially the voice recording and interaction flow.
*   **Responsive:** Quick feedback during recording, API calls, and AI responses.
*   **Engaging:** The voice visualization and clear presentation of AI responses should keep users engaged.
*   **Seamless:** Smooth transitions between different states and screens of the application.
*   **Accessible:** Strive for good accessibility practices. 