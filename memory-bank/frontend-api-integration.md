# Frontend API Integration Guide - MVP

This document provides guidelines for integrating the frontend with the essential API endpoints needed for the MVP, including the new session rating functionality.

## Overview

We're implementing a comprehensive set of API endpoints for the MVP:

1. Create Session
2. Get Session Status
3. Send Audio Message
4. Get Conversation History
5. End Session
6. **NEW**: Submit Session Rating
7. **NEW**: Get Session Rating

## Getting Started

### Importing the API Client

```typescript
import { getApiClient } from '@/services/api/client';
import { ratingService } from '@/services/api/rating';

// In your component or hook
const apiClient = getApiClient();
```

### Using the Essential API Methods

#### Session Management

```typescript
// Create a new session
const createSession = async () => {
  try {
    const response = await apiClient.createSession();
    if (response.success && response.data) {
      const { sessionId } = response.data;
      console.log(`Created session: ${sessionId}`);
      // Store the session ID for future API calls
      return sessionId;
    }
  } catch (error) {
    console.error('Failed to create session:', error);
  }
};

// Get session status
const getSessionStatus = async (sessionId) => {
  try {
    const response = await apiClient.getSession(sessionId);
    if (response.success && response.data) {
      console.log(`Session status: ${response.data.status}`);
      return response.data;
    }
  } catch (error) {
    console.error('Failed to get session:', error);
  }
};

// End a session
const endSession = async (sessionId) => {
  try {
    const response = await apiClient.endSession(sessionId);
    if (response.success && response.data) {
      console.log(`Session ended with summary: ${response.data.summary}`);
      return response.data.summary;
    }
  } catch (error) {
    console.error('Failed to end session:', error);
  }
};
```

#### Conversation

```typescript
// Send audio message
const sendAudio = async (sessionId, audioBlob) => {
  try {
    const response = await apiClient.sendAudioMessage(sessionId, audioBlob);
    if (response.success && response.data) {
      // Handle messages (user message and AI response)
      const messages = response.data.messages;
      console.log('Received messages:', messages);
      return messages;
    }
  } catch (error) {
    console.error('Failed to send audio:', error);
  }
};

// Get conversation history
const getHistory = async (sessionId) => {
  try {
    const response = await apiClient.getConversationHistory(sessionId);
    if (response.success && response.data) {
      const messages = response.data.messages;
      console.log('Conversation history:', messages);
      return messages;
    }
  } catch (error) {
    console.error('Failed to get conversation history:', error);
  }
};
```

#### Session Rating System

```typescript
// Submit a session rating
const submitRating = async (sessionId, rating, feedback) => {
  try {
    const response = await ratingService.submitRating(sessionId, rating, feedback);
    if (response.success) {
      console.log('Rating submitted successfully:', response.data);
      return true;
    } else {
      console.error('Rating submission failed:', response.error);
      return false;
    }
  } catch (error) {
    console.error('Failed to submit rating:', error);
    return false;
  }
};

// Get existing rating for a session
const loadRating = async (sessionId) => {
  try {
    const response = await ratingService.getRating(sessionId);
    if (response.success && response.data?.hasRating) {
      console.log('Loaded existing rating:', response.data.rating);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to load rating:', error);
    return null;
  }
};
```

## Complete Rating Integration Example

Here's how to integrate the rating system in a React component:

```typescript
import React, { useState, useEffect } from 'react';
import { ratingService } from '@/services/api/rating';

const SessionRatingComponent = ({ sessionId }) => {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load existing rating on mount
  useEffect(() => {
    const loadExistingRating = async () => {
      const ratingData = await ratingService.getRating(sessionId);
      if (ratingData.success && ratingData.data?.hasRating) {
        setRating(ratingData.data.rating);
        setSuccess(true);
      }
    };

    if (sessionId) {
      loadExistingRating();
    }
  }, [sessionId]);

  // Auto-save rating when changed
  const handleRatingChange = async (newRating) => {
    if (isSubmitting) return;
    
    setRating(newRating);
    setIsSubmitting(true);
    
    const success = await ratingService.submitRating(sessionId, newRating);
    if (success) {
      setSuccess(true);
    } else {
      setRating(0); // Reset on failure
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="rating-component">
      <p>How was your session?</p>
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingChange(star)}
            disabled={isSubmitting}
            className={`star ${rating >= star ? 'active' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      {success && <p className="success">✓ Rating saved</p>}
    </div>
  );
};
```

## Migrating from Old API Services

### Before

```typescript
import { 
  createSession, 
  sendAudio,
  getHistory, 
  endSession 
} from '@/services/api/session';

// Component code
const startSession = async () => {
  try {
    const { sessionId } = await createSession();
    setSessionId(sessionId);
  } catch (err) {
    handleError(err);
  }
};

const handleRecording = async (audioBlob) => {
  try {
    const response = await sendAudio(sessionId, audioBlob);
    // Handle response
  } catch (err) {
    handleError(err);
  }
};
```

### After

```typescript
import { getApiClient } from '@/services/api/client';
import { ratingService } from '@/services/api/rating';

// Component code
const apiClient = getApiClient();

const startSession = async () => {
  try {
    const response = await apiClient.createSession();
    if (response.success && response.data) {
      setSessionId(response.data.sessionId);
    } else {
      throw new Error(response.error || 'Failed to create session');
    }
  } catch (err) {
    handleError(err);
  }
};

const handleRecording = async (audioBlob) => {
  try {
    const response = await apiClient.sendAudioMessage(sessionId, audioBlob);
    if (response.success && response.data) {
      // Handle messages
      handleMessages(response.data.messages);
    } else {
      throw new Error(response.error || 'Failed to process audio');
    }
  } catch (err) {
    handleError(err);
  }
};

// NEW: Handle rating submission
const handleRating = async (rating) => {
  const success = await ratingService.submitRating(sessionId, rating);
  if (success) {
    showSuccessMessage();
  } else {
    showErrorMessage();
  }
};
```

## Error Handling

### General API Operations
```typescript
const performApiOperation = async () => {
  try {
    const response = await apiClient.someOperation();
    
    if (response.success) {
      // Handle successful response
      return response.data;
    } else {
      // Handle API error
      console.error('API Error:', response.error);
      // Show user-friendly error message
    }
  } catch (error) {
    // Handle network/unexpected errors
    console.error('Unexpected error:', error);
    // Show generic error message
  }
};
```

### Rating-Specific Error Handling
```typescript
const handleRatingSubmission = async (sessionId, rating) => {
  try {
    const response = await ratingService.submitRating(sessionId, rating);
    
    if (response.success) {
      return { success: true, data: response.data };
    } else {
      // Rating-specific errors (invalid rating, session not found, etc.)
      return { success: false, error: response.error };
    }
  } catch (error) {
    // Network or unexpected errors
    return { success: false, error: 'Failed to submit rating. Please try again.' };
  }
};
```

## Testing with the Mock Implementation

During development, the API client uses the mock implementation by default:

```typescript
import { resetApiClient } from '@/services/api/client';

// For local development with mock API
resetApiClient({ useMock: true });

// When backend is available
resetApiClient({ useMock: false, baseUrl: 'https://api.kukucoach.com' });
```

## Rating System Best Practices

### Auto-save Pattern
- Save ratings immediately when user interacts
- Provide visual feedback for loading and success states
- Handle errors gracefully with user feedback

### Loading Existing Ratings
- Always check for existing ratings on component mount
- Display existing ratings to prevent duplicate submissions
- Allow editing of existing ratings

### Error Recovery
- Reset UI state on submission failures
- Provide clear error messages to users
- Allow retry mechanisms for failed submissions

### TypeScript Integration
```typescript
import { RatingSubmission, RatingResponse, RatingData } from '@/services/api/rating';

// Type-safe rating handling
const handleRatingData = (data: RatingData) => {
  if (data.hasRating) {
    displayRating(data.rating, data.feedback);
  } else {
    showEmptyRating();
  }
};
```