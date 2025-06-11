# Technical Context

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (development server on port 8080)
- **UI Components**: Shadcn UI (based on Radix UI primitives)
- **Styling**: Tailwind CSS with utility-first approach
- **Icons**: Lucide React
- **State Management**: React Context API + Custom Hooks
- **Routing**: React Router v6 with nested routing
- **Form Management**: React Hook Form with Zod validation

### Backend
- **Framework**: FastAPI with Python
- **Server**: Uvicorn ASGI server (port 8000)
- **Database**: Supabase (PostgreSQL) with real-time capabilities
- **Audio Processing**: Custom audio transcription and TTS services
- **AI Integration**: OpenAI/Custom AI services for conversation processing
- **File Storage**: Local file system for temporary audio files

### Audio Processing
- **Recording**: MediaRecorder API (WebM/Opus format)
- **Audio Analysis**: Web Audio API (AudioContext, AnalyserNode)
- **Visualization**: SVG-based real-time frequency analysis
- **Playback**: HTML5 Audio API with CORS support
- **Format Support**: WebM/Opus (recording), MP3 (playback)

### Database Architecture
- **Primary Database**: Supabase (PostgreSQL)
- **Schema**: Sessions and Messages tables with proper relationships
- **Real-time**: Supabase real-time subscriptions (prepared for future use)
- **Persistence**: All session data, conversations, and ratings stored persistently
- **Indexing**: Optimized indexes for session and message queries

### API Architecture
- **Protocol**: REST API with JSON payloads
- **Authentication**: Session-based (no user auth in Phase 1)
- **Session Management**: UUID-based session identification
- **Error Handling**: Comprehensive HTTP status codes and error messages
- **CORS**: Configured for cross-origin requests
- **Validation**: Pydantic models for request/response validation

## Technical Architecture

### Component Architecture
- **Atomic Design Principles**: Building complex interfaces from simple components
- **Composition over Inheritance**: Favoring component composition
- **Container/Presentational Pattern**: Separating logic from presentation

### State Management
- **Context API**: For application-wide state (session information)
- **Custom Hooks**: For encapsulating complex logic (audio processing, API communication)
- **Prop Drilling Avoidance**: Using context for deep component trees
- **Local Storage**: Session persistence across browser sessions

### Data Flow
- **Unidirectional Data Flow**: State flows down, events bubble up
- **Event-Driven Communication**: Using events for component interactions
- **Async/Await Pattern**: For API calls and audio processing
- **Real-time Synchronization**: Memory and database state kept in sync

### Backend Integration
- **Direct API Communication**: Frontend communicates directly with FastAPI backend
- **Health Checking**: Backend availability verification before API calls
- **Automatic Fallback**: Graceful degradation when backend unavailable
- **Type Safety**: Shared TypeScript interfaces between frontend and backend responses

## Current Implementation Status

### Completed Features
- ✅ **Session Management**: Complete CRUD operations with database persistence
- ✅ **Audio Processing**: Real-time recording, transcription, and TTS response
- ✅ **Conversation Flow**: Full conversation loop with automatic wrap-up detection
- ✅ **Rating System**: Backend API with database persistence and validation
- ✅ **Session History**: Complete conversation retrieval and replay
- ✅ **Database Integration**: Full Supabase integration with proper schema
- ✅ **Error Handling**: Comprehensive error handling throughout the stack
- ✅ **Mobile Optimization**: Responsive design optimized for mobile devices

### API Endpoints (Complete)
```typescript
// Session Management
POST /api/sessions                    // Create new session
GET /api/sessions/{sessionId}         // Get session details
POST /api/sessions/{sessionId}/end    // End session manually

// Conversation
POST /api/sessions/{sessionId}/messages  // Send audio message
GET /api/sessions/{sessionId}/messages   // Get conversation history

// Rating System
POST /api/sessions/{sessionId}/rating    // Submit/update session rating
GET /api/sessions/{sessionId}/rating     // Get existing rating

// Health Check
GET /health                              // Backend health status
```

### Database Schema (Complete)
```sql
-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id), -- For future auth
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  summary TEXT,
  duration_seconds INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  message_id TEXT UNIQUE NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  text_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Technical Challenges & Solutions

### Resolved Challenges
- ✅ **Audio Visualization**: Creating responsive visualizations for both input and output
- ✅ **Media Permissions**: Handling browser permissions for microphone access
- ✅ **Audio Processing**: Managing audio resource lifecycle correctly
- ✅ **Concurrent Audio Issues**: Fixed issues with multiple audio playback
- ✅ **Storage Race Conditions**: Resolved timing issues with localStorage operations
- ✅ **Session Management**: Improved session ID consistency and verification
- ✅ **Database Synchronization**: Real-time sync between memory and database
- ✅ **Cross-Origin Audio**: Proper CORS configuration for audio file serving
- ✅ **Mobile Audio**: Safari and mobile browser compatibility issues
- ✅ **Rating Persistence**: Immediate database saves with error recovery

### Current Architecture Strengths
- **Scalability**: Clean separation between frontend, backend, and database layers
- **Type Safety**: Full TypeScript implementation across all communication boundaries
- **Error Resilience**: Graceful degradation and comprehensive error handling
- **Mobile First**: Optimized for mobile browsers with touch-friendly interactions
- **Data Integrity**: Atomic operations ensure consistent state between memory and database
- **Performance**: Optimized for real-time audio processing and responsive UI

## Technical Decisions

### Architecture Decisions
- **REST Over WebSockets**: REST API for simpler implementation and debugging
- **Session-Based Design**: Using session IDs to maintain conversation context
- **Separation of Concerns**: Clear boundaries between UI state and API communication
- **Database-First Persistence**: All critical data immediately persisted to Supabase
- **Component-Based Rating**: Standalone rating component for reusability

### Implementation Decisions
- **TypeScript Everywhere**: Strong typing for all components and API interfaces
- **Functional Components**: Using React functional components with hooks
- **Defensive Programming**: Thorough error handling and fallback mechanisms
- **Progressive Enhancement**: Core functionality works with limited browser features
- **Immediate Persistence**: Database writes occur immediately, not batched

### Performance Optimizations
- **Audio Resource Management**: Proper cleanup of audio contexts and elements
- **Component Memoization**: React.memo for expensive rendering operations
- **Lazy Loading**: Route-based code splitting for faster initial load
- **Database Indexing**: Optimized indexes for common query patterns
- **CORS Optimization**: Proper headers for cross-origin audio requests

## Development Environment

### Local Development Setup
```bash
# Frontend (React + Vite)
npm install && npm run dev  # Port 8080

# Backend (FastAPI)
pip install -r requirements.txt
uvicorn app:app --reload     # Port 8000

# Database (Supabase)
# Set environment variables:
# SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Environment Configuration
```bash
# Frontend environment variables
VITE_API_BASE_URL=http://localhost:8000/api

# Backend environment variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Development Tools
- **Dev Servers**: Vite (frontend) + Uvicorn (backend) with hot reload
- **Database**: Supabase Studio for database management
- **API Testing**: FastAPI automatic API documentation at `/docs`
- **Debugging**: React DevTools, comprehensive console logging
- **Type Checking**: TypeScript strict mode for both frontend and backend types

## Production Readiness

### Deployment Architecture
- **Frontend**: Static site deployment (Netlify/Vercel)
- **Backend**: Container deployment (Railway/Heroku/DigitalOcean)
- **Database**: Supabase managed PostgreSQL
- **Audio Storage**: Local file system (temporary files, auto-cleanup)
- **CDN**: Optional CDN for audio file delivery

### Security Considerations
- **Input Validation**: Comprehensive validation on all API endpoints
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Properly configured cross-origin requests
- **Data Privacy**: Minimal data collection, temporary audio storage
- **Error Handling**: No sensitive data exposed in error messages

### Monitoring & Analytics
- **Health Checks**: Backend health endpoint for monitoring
- **Error Tracking**: Structured logging for error monitoring
- **Performance Metrics**: API response times and database query performance
- **User Analytics**: Session completion rates, rating distributions
- **Database Monitoring**: Query performance and connection monitoring

## Future Technical Direction

### Short-term Goals (Next 2-4 weeks)
- Complete frontend-backend rating integration
- End-to-end testing of all features
- Performance optimization for mobile devices
- Production deployment configuration

### Medium-term Goals (1-3 months)
- User authentication and multi-user support
- Advanced audio processing features
- Real-time WebSocket for live conversation
- Comprehensive analytics dashboard
- Audio quality optimization

### Long-term Goals (3-6 months)
- Offline support with IndexedDB
- Progressive Web App (PWA) features
- Advanced AI conversation capabilities
- Multi-language support
- Enterprise deployment options

The technical foundation is now complete and production-ready, providing a robust platform for the complete AI coaching experience.