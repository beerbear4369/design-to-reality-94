/**
 * Session API Service
 * Handles REST API communication for the Kuku Coach application
 * Directly communicates with the real backend API
 */

import { RealApiClient } from './real/RealApiClient';
import { ApiClientConfig, ConversationMessage } from './types';

/**
 * Get the backend URL based on environment
 */
const getBackendUrl = (): string => {
  // Check for environment variable first
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Default to localhost for development
  return 'http://localhost:8000/api';
};

/**
 * Get the backend base URL (without /api) for audio files
 */
const getBackendBaseUrl = (): string => {
  const apiUrl = getBackendUrl();
  return apiUrl.replace('/api', '');
};

// Direct configuration for the real backend
const API_CONFIG: ApiClientConfig = {
  baseUrl: getBackendUrl(),
  useMock: false,
  timeout: 30000
};

// Backend base URL for audio files (without /api)
const BACKEND_BASE_URL = getBackendBaseUrl();

// Create the API client instance
const apiClient = new RealApiClient(API_CONFIG);

// Types for messages aligned with SessionContext
export interface Message {
  id: string;
  timestamp: string;
  sender: "user" | "ai";
  text: string;
  audioUrl?: string;
}

// API Response Types
export interface CreateSessionResponse {
  sessionId: string;
}

export interface SendAudioResponse {
  messageId: string;
  text: string;
  audioUrl: string;
  sessionEnded?: boolean;
  finalSummary?: string;
}

export interface HistoryResponse {
  messages: Message[];
}

export interface EndSessionResponse {
  summaryText: string;
}

// Helper function to convert relative URLs to absolute URLs
function makeAbsoluteUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  
  // If URL is already absolute, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If URL is relative, prepend backend base URL
  if (url.startsWith('/')) {
    return `${BACKEND_BASE_URL}${url}`;
  }
  
  // If URL doesn't start with /, add it
  return `${BACKEND_BASE_URL}/${url}`;
}

// Helper function to convert backend messages to frontend format
function convertMessage(msg: ConversationMessage): Message {
  return {
    id: msg.id,
    timestamp: msg.timestamp,
    sender: msg.sender,
    text: msg.text,
    audioUrl: makeAbsoluteUrl(msg.audioUrl)
  };
}

/**
 * Creates a new conversation session
 */
export async function createSession(existingSessionId?: string): Promise<CreateSessionResponse> {
  console.log('API: Creating session with real backend');
  
  try {
    // Check if backend is available first
    const isHealthy = await apiClient.healthCheck();
    if (!isHealthy) {
      throw new Error('Backend is not available. Please ensure the backend server is running on localhost:8000');
    }
    
    // Create session with the real backend
    const sessionData = await apiClient.createSession();
    console.log('API: Session created successfully:', sessionData.sessionId);
    
    return { sessionId: sessionData.sessionId };
  } catch (error) {
    console.error('API: Session creation failed:', error);
    throw error;
  }
}

/**
 * Sends audio to the backend and receives AI response
 */
export async function sendAudio(sessionId: string, audioBlob: Blob): Promise<SendAudioResponse> {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }
  
  if (!audioBlob) {
    throw new Error('Audio data is required');
  }
  
  console.log(`API: Sending audio for session: ${sessionId}`);
  
  try {
    // Send audio directly to the backend
    const response = await apiClient.sendAudio(sessionId, audioBlob);
    
    if (response.messages.length === 0) {
      throw new Error('No messages received from backend');
    }
    
    // Get the latest AI message from the response
    const aiMessage = response.messages.find(msg => msg.sender === 'ai');
    if (!aiMessage) {
      throw new Error('No AI response found in backend response');
    }
    
    console.log('API: AI response received:', aiMessage.id);
    
    // Check for automatic session ending
    if (response.sessionEnded) {
      console.log('🏁 API: Session automatically ended by backend');
      if (response.finalSummary) {
        console.log('📝 API: Final summary received:', response.finalSummary.substring(0, 100) + '...');
      }
    }
    
    return {
      messageId: aiMessage.id,
      text: aiMessage.text,
      audioUrl: makeAbsoluteUrl(aiMessage.audioUrl) || '',
      sessionEnded: response.sessionEnded,
      finalSummary: response.finalSummary
    };
  } catch (error) {
    console.error('API: Audio processing failed:', error);
    throw error;
  }
}

/**
 * Gets conversation history from the backend
 */
export async function getHistory(sessionId: string): Promise<HistoryResponse> {
  console.log(`API: Getting history for session: ${sessionId}`);
  
  try {
    // Get history directly from the backend
    const messages = await apiClient.getMessages(sessionId);
    
    const convertedMessages = messages.map(convertMessage);
    
    console.log('API: History retrieved:', convertedMessages.length, 'messages');
    
    return { messages: convertedMessages };
  } catch (error) {
    console.error('API: History retrieval failed:', error);
    throw error;
  }
}

/**
 * Ends a conversation session
 */
export async function endSession(sessionId: string): Promise<EndSessionResponse> {
  console.log(`API: Ending session: ${sessionId}`);
  
  // TODO: Implement backend endpoint for ending sessions
  // For now, return a simple response
  return {
    summaryText: "Session ended successfully. Backend session termination endpoint not yet implemented."
  };
} 