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
- **Visualization:** Custom visualization components with SVG:
  - `voice-visualization.tsx` - Four-layer wave visualization with animated mask
  - `audio-wave-generator.ts` - Wave path generation algorithms
  - Dynamic frequency-based amplitude modulation

### Mock Backend
- **API Service:** Modular services in `/services/api/`
- **WebSocket:** Custom WebSocket implementation in `/services/websocket/`
- **Storage:** LocalStorage-based persistence in `/services/storage/`
- **Mock Responses:** Predefined response patterns in `/services/mock/responses.ts`

## 2. Development Setup

The project is set up with Vite and uses the following structure:
- `/src`: Main source code
- `/src/components`: Reusable UI components
- `/src/components/kuku-coach`: Specific components for the Kuku Coach application
- `/src/pages`: Page-level components
- `/src/services`: Backend service implementations
  - `/src/services/api`: REST API endpoints
  - `/src/services/websocket`: WebSocket communication
  - `/src/services/storage`: Data persistence
  - `/src/services/mock`: Mock data and responses
- `/src/hooks`: Custom React hooks
- `/src/lib`: Utility functions/helpers
- `/src/context`: React Context providers

## 3. Technical Implementation

### Voice Visualization
The voice visualization uses SVG-based waveforms with multiple layers:
- Four distinct waveform types (smooth, complex, dynamic, asymmetric)
- Each wave responds to different frequency ranges
- Real-time animation with variable speed and amplitude
- Mask-based circular clipping
- Dynamic color gradients with glow effects
- Responsive to audio input levels
- Performance-optimized with controlled animation framerate

### Audio Processing
- Audio capture using MediaRecorder API
- Real-time audio analysis with AudioContext and AnalyserNode
- Frequency analysis using Fast Fourier Transform (FFT)
- Audio level detection for visualization reactivity
- Blob-based audio storage for API transmission

### WebSocket Communication
- Custom WebSocket wrapper with event-based architecture
- Bidirectional communication between client and mock server
- Event typing for type safety
- Simulated server-side processing delays
- Automatic reconnection handling

## 4. Technical Constraints

- Browser API limitations for audio recording (browser compatibility)
- Security considerations for microphone access (requires user permission)
- Potential latency in audio transfer and processing
- Browser requirements for MediaRecorder API (not supported in all browsers/versions)
- LocalStorage limitations for data persistence (size and persistence)

## 5. Dependencies

Key dependencies in the project include:
- React v18
- React Router v6
- TanStack Query v5
- Various Radix UI components (via Shadcn/UI)
- Tailwind CSS

Audio-specific features rely on the browser's built-in MediaRecorder API and Web Audio API.

## 6. API Integration

The mock backend implements these endpoints:

### REST API
- `POST /api/session` - Create new session
- `GET /api/session/{id}` - Get session by ID
- `PUT /api/session/{id}` - Update session
- `DELETE /api/session/{id}` - Delete session
- `POST /api/session/{id}/end` - End session and get summary
- `POST /api/audio/transcribe` - Convert audio to text
- `POST /api/audio/synthesize` - Generate speech from text

### WebSocket Events
**Client to Server:**
- `client:start-recording` - Indicate recording start
- `client:audio-data` - Send audio chunk
- `client:stop-recording` - Indicate recording end

**Server to Client:**
- `server:recording-started` - Acknowledge recording
- `server:thinking` - AI is processing
- `server:response` - Text response
- `server:audio-response` - Audio URL for playback 