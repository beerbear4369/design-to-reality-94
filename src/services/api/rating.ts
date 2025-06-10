/**
 * Rating API Service
 * Handles session rating functionality
 */

// Get the backend URL based on environment
const getBackendUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getBackendUrl();

// Types for rating functionality
export interface RatingSubmission {
  rating: number;          // 1-5 scale
  feedback?: string;       // Optional feedback
}

export interface RatingResponse {
  success: boolean;
  data?: {
    sessionId: string;
    rating: number;
    feedback: string;
    timestamp: string;
  };
  error?: string;
}

export interface RatingData {
  sessionId: string;
  rating: number | null;
  feedback: string | null;
  hasRating: boolean;
}

export const ratingService = {
  // Submit a new rating
  async submitRating(sessionId: string, rating: number, feedback?: string): Promise<RatingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, feedback }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Rating submission failed:', error);
      return {
        success: false,
        error: 'Failed to submit rating. Please try again.',
      };
    }
  },

  // Get existing rating for a session
  async getRating(sessionId: string): Promise<{ success: boolean; data?: RatingData; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/rating`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Rating retrieval failed:', error);
      return {
        success: false,
        error: 'Failed to load rating data.',
      };
    }
  },
}; 