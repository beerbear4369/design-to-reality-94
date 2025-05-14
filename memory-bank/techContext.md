# Tech Context: Kuku Coach

## 1. Tech Stack

### Frontend
- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **UI Components:** Shadcn/UI 
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Data Fetching:** TanStack Query (React Query)
- **State Management:** React Context API (initial approach)

### Voice & Audio
- **Recording:** Web Audio API & MediaRecorder API
- **Playback:** HTML5 Audio Element
- **Visualization:** Custom visualization components in the existing codebase:
  - `voice-visualization.tsx`
  - `audio-wave-generator.ts`

## 2. Development Setup

The project is set up with Vite and uses the following structure:
- `/src`: Main source code
- `/src/components`: Reusable UI components
- `/src/components/kuku-coach`: Specific components for the Kuku Coach application
- `/src/pages`: Page-level components
- `/src/lib`: Utility functions/helpers
- `/src/hooks`: Custom React hooks

## 3. Technical Constraints

- Browser API limitations for audio recording (browser compatibility)
- Security considerations for microphone access (requires user permission)
- Potential latency in audio transfer and processing
- Browser requirements for MediaRecorder API (not supported in all browsers/versions)

## 4. Dependencies

Key dependencies in the project include:
- React v18
- React Router v6
- TanStack Query v5
- Various Radix UI components (via Shadcn/UI)
- Tailwind CSS

Audio-specific features rely on the browser's built-in MediaRecorder API and Web Audio API.

## 5. API Integration

The frontend will integrate with backend APIs for:
- Session creation
- Audio processing
- Response generation
- Session summary

Assumed API endpoints (to be confirmed/refined):
- `POST /api/session/start` - Start a new coaching session
- `POST /api/session/{sessionId}/audio` - Send user audio recording
- `POST /api/session/{sessionId}/end` or `GET /api/session/{sessionId}/summary` - End session and get summary 