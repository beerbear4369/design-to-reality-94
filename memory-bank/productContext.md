# Product Context: Kuku Coach

## 1. Why This Project Exists
Kuku Coach aims to provide an accessible and engaging platform for AI-powered coaching. It leverages voice interaction to create a more natural and personal coaching experience, available directly in a web or mobile browser without requiring native app installations.

## 2. Problems It Solves

*   Provides on-demand coaching and conversational AI interaction.
*   Offers a user-friendly interface for users who prefer voice over text.
*   Makes AI coaching more accessible by being browser-based.
*   Creates a more engaging and visually appealing experience with dynamic voice visualization.
*   Simplifies the coaching process with a straightforward three-screen flow.

## 3. How It Should Work (User Flow)

1.  **Start Screen:** The user is greeted with an initial screen (`StartSessionPage`).
    *   Displays: "Kuku Coach", "Your AI Coaching Assistant", and a "Start Session" button.
    *   Visually appealing background with subtle Tailwind gradients.
    *   Optional: Brief description of what to expect from a coaching session.

2.  **Session Start:** Upon clicking "Start Session":
    *   The frontend initiates a new session with the mock backend.
    *   The user is navigated to the `ActiveSessionPage` with the session ID in the URL.
    *   WebSocket connection established for real-time communication.

3.  **Active Session Screen (`ActiveSessionPage`)**:
    *   Displays: "Kuku Coach" title, "Speak to your coach" subtitle.
    *   A central circular area shows a voice waveform visualization with multiple animated layers.
    *   An initial message from the AI is displayed automatically (e.g., "I'm here to help you with your goals. What would you like to discuss today?").
    *   A prominent recording button is available at the bottom of the screen.

4.  **User Interaction:**
    *   User clicks the record button to start speaking.
    *   The button changes appearance to indicate recording state.
    *   The voice visualization becomes active, responding to the user's voice.
    *   The frontend captures and analyzes the audio in real-time.
    *   User clicks the button again (or it auto-stops after silence) to finish recording.
    *   The frontend sends the audio to the backend via WebSocket.

5.  **AI Response Processing:**
    *   The visualization transitions to a "thinking" state.
    *   "Kuku is thinking..." indicator appears.
    *   The backend processes the audio (simulated in our mock implementation).
    *   After a brief delay, the AI response is generated.

6.  **AI Response Playback:**
    *   The backend sends the AI's text response and audio URL.
    *   The frontend displays the text with a typing animation.
    *   The audio response plays automatically.
    *   The voice visualization responds to the AI's voice.
    *   Upon completion, the recording button becomes available again.

7.  **Conversation Continues:** The user can then record another message, and the cycle repeats.

8.  **Session End:** When the conversation is complete (either by user indication or AI guidance):
    *   The backend generates a session summary.
    *   The frontend navigates to the `SessionSummaryPage`.

9.  **Session Summary Screen (`SessionSummaryPage`)**:
    *   Displays: "Session Summary" title.
    *   Shows the summary text of the coaching session.
    *   Asks "How was your coaching experience?" with a 5-star rating system.
    *   Provides a "Start New Session" button (navigates to `StartSessionPage`).
    *   Provides a "View Session History" button (placeholder for future functionality).

## 4. User Experience Goals

*   **Intuitive:** Easy to understand and use, especially the voice recording and interaction flow.
*   **Responsive:** Quick feedback during recording, API calls, and AI responses with appropriate loading states.
*   **Visually Engaging:** The multi-layered voice visualization and clear presentation of AI responses maintain user interest.
*   **Seamless:** Smooth transitions between different states (idle, recording, thinking, responding) and screens.
*   **Accessible:** Good accessibility practices for screen readers and keyboard navigation.
*   **Modern:** Clean, contemporary UI with glass-effect components and subtle animations.
*   **Consistent:** Unified design language across all screens with proper spacing and typography. 