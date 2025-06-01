/**
 * Real API Client Implementation
 * Implements the BackendApiClient interface for production use with a real backend
 */

import { BackendApiClient, ApiClientConfig, SessionData, ConversationMessage } from '../types';

export class RealApiClient implements BackendApiClient {
  constructor(private config: ApiClientConfig) {}

  /**
   * Create a new session
   */
  async createSession(): Promise<SessionData> {
    try {
      console.log('Creating new session...');
      
      const response = await fetch(`${this.config.baseUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
        
      if (!data.success) {
        throw new Error(data.error || 'Failed to create session');
        }
        
      console.log('Session created successfully:', data.data.sessionId);
      return data.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }
  
  /**
   * Send audio data to the backend
   */
  async sendAudio(sessionId: string, audioBlob: Blob): Promise<{
    messages: ConversationMessage[];
    sessionEnded?: boolean;
    finalSummary?: string;
  }> {
    try {
      console.log(`Sending audio for session: ${sessionId}`);
      console.log(`Audio blob size: ${audioBlob.size} bytes`);

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`${this.config.baseUrl}/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to send audio: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process audio');
      }

      console.log('Audio processed successfully, received messages:', data.data.messages.length);
      
      // Check for automatic session ending fields
      if (data.data.sessionEnded) {
        console.log('🏁 Session automatically ended by backend');
        if (data.data.finalSummary) {
          console.log('📝 Final summary provided:', data.data.finalSummary);
        }
      }
      
      return {
        messages: data.data.messages,
        sessionEnded: data.data.sessionEnded,
        finalSummary: data.data.finalSummary
      };
    } catch (error) {
      console.error('Error sending audio:', error);
      throw error;
    }
  }
  
  /**
   * Get conversation messages for a session
   */
  async getMessages(sessionId: string): Promise<ConversationMessage[]> {
    try {
      console.log(`Getting messages for session: ${sessionId}`);

      const response = await fetch(`${this.config.baseUrl}/sessions/${sessionId}/messages`);

      if (!response.ok) {
        throw new Error(`Failed to get messages: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get messages');
    }

      console.log('Messages retrieved successfully:', data.data.messages.length);
      return data.data.messages;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }
  
  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
} 