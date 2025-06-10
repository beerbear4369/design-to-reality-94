# Backend Integration Plan - MVP

## Overview
This document outlines the minimal required backend API specifications for the Kuku Coach MVP, focusing on the core conversation flow and session rating functionality.

## Architecture

### Current Implementation
- Mock API services simulate backend responses
- REST API-based design for simplicity and reliability
- Message state handled in local storage for persistence
- Session rating system with immediate backend persistence

### Target Architecture
- Clean API client interfaces that can switch between mock and real implementations
- Single source of truth for backend communication
- Proper separation between data fetching and UI state
- Integrated rating system with Supabase persistence

## API Client Interface

```typescript
// Base types for all API responses
interface ApiResponse {
  success: boolean;
  error?: string;
}

// Essential API Client Interface for MVP
interface KukuCoachApiClient {
  // Session Management
  createSession(): Promise<SessionResponse>;
  getSession(sessionId: string): Promise<SessionResponse>;
  endSession(sessionId: string): Promise<SummaryResponse>;
  
  // Conversation
  sendAudioMessage(sessionId: string, audioBlob: Blob): Promise<MessageResponse>;
  getConversationHistory(sessionId: string): Promise<ConversationHistoryResponse>;
  
  // Rating System
  submitRating(sessionId: string, rating: number, feedback?: string): Promise<RatingResponse>;
  getRating(sessionId: string): Promise<RatingDataResponse>;
}
```

## Essential API Endpoints

### Session Endpoints

#### POST /api/sessions
Creates a new coaching session.

Request: (empty or with optional parameters)

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "session-1234567890",
    "createdAt": "2023-06-15T10:30:00Z",
    "status": "active"
  }
}
```

#### GET /api/sessions/{sessionId}
Gets the status and details of an existing session.

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "session-1234567890",
    "createdAt": "2023-06-15T10:30:00Z",
    "updatedAt": "2023-06-15T10:35:00Z",
    "status": "active",
    "messageCount": 6
  }
}
```

#### POST /api/sessions/{sessionId}/end
Ends an active session and generates a summary.

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "session-1234567890",
    "summary": "Session summary text...",
    "duration": 300,
    "messageCount": 6
  }
}
```

### Conversation Endpoints

#### POST /api/sessions/{sessionId}/messages
Sends audio to be processed and receives AI response.

Request:
- Content-Type: multipart/form-data
- Audio file as 'audio' field

Response:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-user-123",
        "timestamp": "2023-06-15T10:31:00Z",
        "sender": "user",
        "text": "Transcribed user message"
      },
      {
        "id": "msg-ai-456",
        "timestamp": "2023-06-15T10:31:05Z",
        "sender": "ai",
        "text": "AI response message",
        "audioUrl": "https://api.kukucoach.com/audio/response-456.mp3"
      }
    ]
  }
}
```

#### GET /api/sessions/{sessionId}/messages
Gets the conversation history for a session.

Response:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-user-123",
        "timestamp": "2023-06-15T10:31:00Z",
        "sender": "user", 
        "text": "User message"
      },
      {
        "id": "msg-ai-456",
        "timestamp": "2023-06-15T10:31:05Z",
        "sender": "ai",
        "text": "AI response message",
        "audioUrl": "https://api.kukucoach.com/audio/response-456.mp3"
      }
      // Additional messages...
    ]
  }
}
```

### Rating Endpoints

#### POST /api/sessions/{sessionId}/rating
Submits a rating for a completed session.

Request:
```json
{
  "rating": 4,                    // Required: 1-5 scale
  "feedback": "Great session!"    // Optional: text feedback
}
```

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "session-1234567890",
    "rating": 4,
    "feedback": "Great session!",
    "timestamp": "2023-06-15T10:45:00Z"
  }
}
```

#### GET /api/sessions/{sessionId}/rating
Retrieves the existing rating for a session.

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "session-1234567890",
    "rating": 4,
    "feedback": "Great session!",
    "hasRating": true
  }
}
```

Response (No rating exists):
```json
{
  "success": true,
  "data": {
    "sessionId": "session-1234567890",
    "rating": null,
    "feedback": null,
    "hasRating": false
  }
}
```

## Error Handling

All API error responses should follow this pattern:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common error cases:
- Session not found
- Invalid session ID
- Audio processing failed
- Session already ended
- Invalid rating value (must be 1-5)
- Rating submission failed

## Rating System Integration

### Database Schema (Supabase)
The rating system requires a `session_ratings` table with the following structure:
- `session_id` (VARCHAR, Primary Key)
- `rating` (INTEGER, 1-5 scale)
- `feedback` (TEXT, Optional)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Frontend Integration
- Auto-loads existing ratings when SessionSummaryPage mounts
- Auto-saves ratings immediately when user clicks a star
- Provides visual feedback for loading states and success
- Handles errors gracefully with rating reset

## Implementation Plan

### Priority Order
1. POST /api/sessions (Create session)
2. POST /api/sessions/{sessionId}/messages (Send audio)
3. GET /api/sessions/{sessionId}/messages (Get conversation history)
4. GET /api/sessions/{sessionId} (Check session status)
5. POST /api/sessions/{sessionId}/end (End session)
6. **NEW**: POST /api/sessions/{sessionId}/rating (Submit rating)
7. **NEW**: GET /api/sessions/{sessionId}/rating (Get rating)

### Rating System Requirements
- Backend must validate rating values (1-5 scale)
- Only completed sessions should accept ratings
- Ratings should be updatable (allow editing)
- Proper error handling for network failures
- Database persistence in Supabase