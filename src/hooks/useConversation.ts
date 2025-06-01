/**
 * Custom hook for managing conversation state and API calls
 * SIMPLIFIED: Direct response flow without conversation history
 */

import { useState, useCallback, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { sendAudio } from '@/services/api/session';

export interface CurrentResponse {
  text: string;
  audioUrl?: string;
  messageId: string;
}

export function useConversation() {
  const session = useSession();
  const [currentResponse, setCurrentResponse] = useState<CurrentResponse | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState<boolean>(false);
  const [pendingResponse, setPendingResponse] = useState<boolean>(false);

  // Debug: Log when currentResponse changes
  useEffect(() => {
    console.log('📱 currentResponse state changed:', {
      hasResponse: !!currentResponse,
      messageId: currentResponse?.messageId,
      hasText: !!currentResponse?.text,
      hasAudioUrl: !!currentResponse?.audioUrl,
      timestamp: new Date().toISOString()
    });
  }, [currentResponse]);

  // When we have a new response and are pending, set status to responding
  useEffect(() => {
    console.log('🔄 useConversation useEffect triggered:', {
      hasCurrentResponse: !!currentResponse,
      hasPendingResponse: pendingResponse,
      currentStatus: session.status,
      responseData: currentResponse ? {
        messageId: currentResponse.messageId,
        hasText: !!currentResponse.text,
        hasAudioUrl: !!currentResponse.audioUrl,
        textLength: currentResponse.text?.length || 0
      } : null,
      timestamp: new Date().toISOString()
    });

    if (currentResponse && pendingResponse) {
      console.log('🔄 ✅ Setting status to responding - conditions met');
      session.setStatus('responding');
      setPendingResponse(false);
    } else {
      console.log('🔄 ❌ Not setting status - missing conditions');
    }
  }, [currentResponse, pendingResponse]);

  /**
   * Send audio data to the backend and get immediate response
   */
  const sendAudioData = useCallback(async (audioBlob: Blob): Promise<void> => {
    if (!audioBlob) {
      console.error('useConversation: No audio data to send');
      throw new Error('No audio data to send');
    }

    // Prevent duplicate processing
    if (isProcessingAudio) {
      console.log('useConversation: Already processing audio, ignoring this request');
      return Promise.resolve(); 
    }

    // Ensure we have a session
    if (!session.sessionId) {
      throw new Error('No active session. Please start a new session.');
    }

    console.log(`useConversation: Sending audio data to session ${session.sessionId}`);

    try {
      setIsProcessingAudio(true);

      // Update UI state to "thinking/processing"
      session.setStatus('processing');

      console.log(`useConversation: Calling sendAudio API with session ${session.sessionId}`);

      // Wait for API response - get the actual AI response
      const response = await sendAudio(session.sessionId!, audioBlob);
      
      console.log(`useConversation: Received API response:`, {
        messageId: response.messageId,
        text: response.text,
        audioUrl: response.audioUrl
      });

      // Store the current response for immediate use
      const newResponse = {
        messageId: response.messageId,
        text: response.text,
        audioUrl: response.audioUrl
      };
      
      console.log('📱 ✅ Setting new currentResponse:', newResponse);
      setCurrentResponse(newResponse);

      // Mark that we're pending a status change (will be handled by useEffect)
      setPendingResponse(true);

      console.log('useConversation: Audio processing completed successfully');

    } catch (err) {
      console.error('useConversation: Error sending audio data:', err);
      const error = err instanceof Error ? err : new Error('Failed to process audio');
      session.setError(error.message);

      // Reset status on error
      session.setStatus('error');
      throw error;
    } finally {
      setIsProcessingAudio(false);
    }
  }, [session.sessionId, isProcessingAudio]);

  return {
    // Session state
    sessionId: session.sessionId,
    currentResponse,
    status: session.status,
    error: session.error,

    // Processing state
    isProcessingAudio,

    // Actions
    sendAudioData,

    // Session control
    setError: session.setError,
    setStatus: session.setStatus
  };
} 