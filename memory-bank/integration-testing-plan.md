# Integration Testing Plan - MVP

This document outlines the testing plan for the essential API endpoints needed for the Kuku Coach MVP, including the new session rating functionality.

## Essential Endpoints to Test

1. `POST /api/sessions` - Create a new coaching session
2. `GET /api/sessions/{sessionId}` - Get session status
3. `POST /api/sessions/{sessionId}/messages` - Send audio and get AI response
4. `GET /api/sessions/{sessionId}/messages` - Get conversation history
5. `POST /api/sessions/{sessionId}/end` - End session and get summary
6. **NEW**: `POST /api/sessions/{sessionId}/rating` - Submit session rating
7. **NEW**: `GET /api/sessions/{sessionId}/rating` - Get session rating

## Test Cases

### 1. Session Creation

| Test ID | Description | Expected Outcome | Priority |
|---------|-------------|------------------|----------|
| S-01    | Create new session | Successfully returns valid session ID | HIGH |
| S-02    | Create multiple sessions | Each session has a unique ID | MEDIUM |
| S-03    | Create session with invalid request format | Returns appropriate error | LOW |

### 2. Session Status

| Test ID | Description | Expected Outcome | Priority |
|---------|-------------|------------------|----------|
| S-04    | Get existing session | Successfully returns session details | HIGH |
| S-05    | Get non-existent session | Returns appropriate error | MEDIUM |
| S-06    | Get session with invalid ID format | Returns validation error | LOW |

### 3. Audio Conversation

| Test ID | Description | Expected Outcome | Priority |
|---------|-------------|------------------|----------|
| A-01    | Send short audio message | Returns transcription and AI response | HIGH |
| A-02    | Send longer audio message (30s) | Successfully processes longer audio | MEDIUM |
| A-03    | Send audio in different formats (MP3, WAV, WebM) | Successfully handles different formats | MEDIUM |
| A-04    | Send malformed audio data | Returns appropriate error | MEDIUM |
| A-05    | Send audio to non-existent session | Returns appropriate error | MEDIUM |

### 4. Conversation History

| Test ID | Description | Expected Outcome | Priority |
|---------|-------------|------------------|----------|
| H-01    | Get history for new session | Returns empty message array | MEDIUM |
| H-02    | Get history after sending messages | Returns complete message history | HIGH |
| H-03    | Get history for non-existent session | Returns appropriate error | MEDIUM |
| H-04    | Verify message order in history | Messages in chronological order | MEDIUM |

### 5. End Session

| Test ID | Description | Expected Outcome | Priority |
|---------|-------------|------------------|----------|
| E-01    | End active session | Successfully ends session and returns summary | HIGH |
| E-02    | End already ended session | Returns appropriate error | MEDIUM |
| E-03    | End non-existent session | Returns appropriate error | MEDIUM |

### 6. Session Rating System

| Test ID | Description | Expected Outcome | Priority |
|---------|-------------|------------------|----------|
| R-01    | Submit valid rating (1-5) | Successfully saves rating to database | HIGH |
| R-02    | Submit rating with feedback | Successfully saves rating and feedback | HIGH |
| R-03    | Submit invalid rating (0, 6, negative) | Returns validation error | MEDIUM |
| R-04    | Submit rating to non-existent session | Returns appropriate error | MEDIUM |
| R-05    | Get rating for session with existing rating | Returns correct rating data | HIGH |
| R-06    | Get rating for session without rating | Returns hasRating: false | MEDIUM |
| R-07    | Update existing rating | Successfully overwrites previous rating | MEDIUM |
| R-08    | Submit rating to active session | Returns error (only ended sessions) | MEDIUM |

## Test Flow

For comprehensive testing, execute tests in this sequence:

1. Create session (S-01)
2. Verify session status (S-04)
3. Send audio message (A-01)
4. Verify conversation history (H-02)
5. End session (E-01)
6. **NEW**: Submit session rating (R-01)
7. **NEW**: Verify rating persistence (R-05)
8. **NEW**: Update rating (R-07)

## Extended Test Flow for Rating System

### Complete User Journey Test
1. Create new session
2. Send multiple audio messages
3. End session with summary
4. Submit 4-star rating with feedback
5. Navigate away and return to summary page
6. Verify rating is displayed correctly
7. Change rating to 5 stars
8. Verify updated rating is saved

### Edge Case Testing
1. Attempt to rate active session (should fail)
2. Submit rating with special characters in feedback
3. Submit rating without feedback (should succeed)
4. Submit multiple ratings rapidly (test race conditions)

## Test Environment Setup

### Frontend Configuration

```typescript
// In src/services/api/client.ts
import { resetApiClient } from '@/services/api/client';

// For local development against real backend
resetApiClient({
  useMock: false,
  baseUrl: 'http://localhost:8080/api'
});
```

### Backend Configuration

The backend should be configured to:

1. Allow CORS from the frontend development server
2. Log all API requests for debugging
3. Return standardized error formats
4. **NEW**: Validate rating values (1-5 scale)
5. **NEW**: Persist ratings to Supabase database
6. **NEW**: Check session status before accepting ratings

### Supabase Database Schema

Ensure the following table exists for rating tests:

```sql
CREATE TABLE session_ratings (
    session_id VARCHAR PRIMARY KEY,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Test Data

### Test Audio Files

Create a collection of test audio files:
- Short samples (5 seconds)
- Medium samples (15-30 seconds)
- Different formats (MP3, WAV, WebM)

### Test Rating Data

Create test data for rating scenarios:
- Valid ratings: 1, 2, 3, 4, 5
- Invalid ratings: 0, 6, -1, null, undefined
- Feedback samples: short text, long text, special characters, empty string

## Implementation Priorities

To facilitate incremental testing and development, backend implementation should follow this priority order:

1. POST /api/sessions (Create session)
2. POST /api/sessions/{sessionId}/messages (Send audio)
3. GET /api/sessions/{sessionId}/messages (Get conversation history)
4. GET /api/sessions/{sessionId} (Check session status)
5. POST /api/sessions/{sessionId}/end (End session)
6. **NEW**: POST /api/sessions/{sessionId}/rating (Submit rating)
7. **NEW**: GET /api/sessions/{sessionId}/rating (Get rating)

## Success Criteria

Integration testing will be considered successful when:

1. All HIGH priority tests pass with the expected outcomes
2. Response times are within acceptable limits (< 5 seconds for audio processing, < 1 second for rating operations)
3. Error handling correctly manages expected failure modes
4. Complete user journey can be completed without errors
5. **NEW**: Rating system provides immediate feedback and persistence
6. **NEW**: Rating data is correctly stored in Supabase database
7. **NEW**: Rating validation prevents invalid submissions

## Testing Schedule

| Phase | Focus Area | Deliverables |
|------|------------|--------------|
| 1    | Individual endpoint testing | Validation of each endpoint in isolation |
| 2    | End-to-end flow testing | Validation of complete user journey |
| 3    | **NEW**: Rating system testing | Validation of rating submission and retrieval |
| 4    | **NEW**: Database persistence testing | Validation of Supabase integration |

## Rating System Specific Tests

### Frontend Integration Tests
- Test auto-loading of existing ratings
- Test auto-saving when user clicks stars
- Test visual feedback (loading states, success messages)
- Test error handling and recovery
- Test component state management

### Backend Integration Tests
- Test rating validation (1-5 scale)
- Test session status validation (only ended sessions)
- Test database persistence and retrieval
- Test rating updates and overwrites
- Test error responses for invalid inputs

## Issue Tracking

All issues discovered during testing should be documented with:
1. Test ID
2. Issue description
3. Steps to reproduce
4. Expected vs. actual outcome
5. Severity (Critical, Major, Minor, Cosmetic)
6. **NEW**: Component affected (Frontend UI, Backend API, Database)