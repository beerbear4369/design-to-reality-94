# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
```bash
npm run dev          # Start development server on localhost:8080
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Testing and Verification
```bash
node scripts/test-production-config.js    # Test production configuration
node scripts/verify-deployment.js         # Verify deployment readiness
```

## Architecture Overview

### Core Application Structure
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with Shadcn/UI components
- **State Management**: React Context API + TanStack Query
- **Routing**: React Router v6 with session-based routing
- **Audio Processing**: Web Audio API for voice recording and visualization

### Key Pages and Flow
1. **StartSessionPage** (`/`) - Entry point for new sessions
2. **ActiveSessionPage** (`/session/:sessionId`) - Main voice interaction interface
3. **SessionSummaryPage** (`/summary/:sessionId`) - Post-session summary
4. **SessionHistoryPage** (`/session/:sessionId/history`) - Conversation history

### Session Management
- Sessions are managed through `SessionContext` with real backend API integration
- Backend API URL configured via `VITE_API_BASE_URL` environment variable
- Default development URL: `http://localhost:8000/api`
- Session IDs are extracted from URL parameters and stored in localStorage

### API Client Architecture
- **Real API Client**: `src/services/api/real/RealApiClient.ts` - Production backend integration
- **Mock API Client**: `src/services/api/mock/MockApiClient.ts` - Development/testing fallback
- **Factory Pattern**: `src/services/api/client.ts` creates appropriate client based on configuration
- **Types**: Centralized in `src/services/api/types.ts` for consistent interfaces

### Voice and Audio Features
- Real-time voice recording with visual feedback
- Multi-layered waveform visualization using SVG masks
- Audio level detection and visualization
- WebSocket connection for real-time communication
- Audio file upload and playback management

## Project-Specific Conventions

### File Organization
- Think Clear components: `src/components/kuku-coach/`
- Hooks: `src/hooks/` (names start with `use`)
- Pages: `src/pages/` (names end with `Page.tsx`)
- Services: `src/services/` (organized by function type)
- Contexts: `src/contexts/` (names end with `Context.tsx`)

### Component Patterns
- Glass effect for message containers (backdrop-blur with semi-transparent background)
- 16px base spacing throughout the application
- Subtle animations for state transitions (200-300ms duration)
- Purple/blue color palette
- SVG-based voice visualization with mask-based circular clipping

### Backend Integration
- Environment variable `VITE_API_BASE_URL` configures backend URL
- Production backend expected at Railway/Render deployment
- CORS configured for frontend origin
- FormData used for audio file uploads
- Session management via REST API endpoints

### Development Workflow
- Always identify root cause before implementing fixes
- Ask clarifying questions when requirements are unclear
- Propose implementation approaches before coding
- Test features individually before moving to next feature
- Use existing development server instance rather than creating new ones

## Environment Configuration

### Development
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Production
```env
VITE_API_BASE_URL=https://your-backend-url.com/api
```

## Deployment

### Netlify (Current)
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirects configured in `netlify.toml`
- Security headers and caching configured

### Alternative Platforms
- Vercel: Standard React deployment
- Railway: Container-based deployment
- Render: Static site deployment

## Integration Notes

- Backend API integration is complete with `RealApiClient`
- Comprehensive integration documentation in `integration doc/`
- Postman collection available for API testing
- Rating system integrated with Supabase backend
- WebSocket events follow convention: `[source]:[event]`