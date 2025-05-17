import { useState, useCallback, useRef, useEffect } from 'react';
import { useSession, Message } from '@/contexts/SessionContext';
import { 
  createSession, 
  sendAudio, 
  getHistory, 
  endSession 
} from '@/services/api/session';

/**
 * Custom hook for managing conversation with the AI coach using REST API
 * This is the sole interface between the UI and backend services
 */
export function useConversation() {
  const session = useSession();
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Track the state of the current recording process
  const processingRef = useRef<boolean>(false);
  const latestMessageIdRef = useRef<string | null>(null);
  
  // Ensure session initialization on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        console.log('useConversation: Initializing session handling');
        
        // If no session ID is available, create one
        if (!session.sessionId) {
          console.log('useConversation: No session ID found, initializing new session');
          await startConversation();
        } else {
          console.log(`useConversation: Using existing session ID: ${session.sessionId}`);
          
          // Force session creation in the API to ensure it exists
          try {
            console.log(`useConversation: Creating or verifying session in API: ${session.sessionId}`);
            await createSession(session.sessionId);
            console.log(`useConversation: Session verified in API`);
            
            // Try to load conversation history
            await fetchHistory();
          } catch (err) {
            console.error('useConversation: Error initializing existing session, starting new one:', err);
            await startConversation();
          }
        }
      } catch (err) {
        console.error('useConversation: Failed to initialize session on mount:', err);
        session.setError('Failed to initialize session. Please refresh the page.');
      }
    };
    
    initSession();
  }, [session.sessionId]);
  
  /**
   * Initialize a new session
   */
  const startConversation = useCallback(async (): Promise<void> => {
    try {
      // Prevent duplicate session creation if already in progress
      if (processingRef.current) return;
      processingRef.current = true;
      
      console.log('useConversation: Starting new conversation');
      
      // If we already have a session ID, use it when creating the API session
      const existingSessionId = session.sessionId;
      if (existingSessionId) {
        console.log(`useConversation: Using existing session ID for API: ${existingSessionId}`);
      }
      
      // Create a new session through the API, passing any existing session ID
      const response = await createSession(existingSessionId);
      
      // Update session context with new session ID
      if (response.sessionId) {
        console.log(`useConversation: Created new session, ID: ${response.sessionId}`);
        
        // Important: Use the exact same session ID that was created by the API
        // This ensures consistency between SessionContext and the API storage
        await session.startSession(response.sessionId);
        
        console.log(`useConversation: Session context updated with ID: ${session.sessionId}`);
        
        // Clear messages for new session
        setMessages([]);
      }
    } catch (err) {
      console.error('useConversation: Error starting conversation', err);
      const error = err instanceof Error ? err : new Error('Failed to start conversation');
      session.setError(error.message);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [session]);
  
  /**
   * End the current conversation session
   */
  const endConversation = useCallback(async (): Promise<void> => {
    try {
      if (session.sessionId) {
        console.log(`useConversation: Ending session ${session.sessionId}`);
        // End the session through the API
        await endSession(session.sessionId);
        
        // Update local session state
        await session.endSession();
        
        // Clear messages
        setMessages([]);
        
        console.log('useConversation: Session ended successfully');
      } else {
        console.warn('useConversation: No active session to end');
      }
    } catch (err) {
      console.error('useConversation: Error ending conversation', err);
      const error = err instanceof Error ? err : new Error('Failed to end conversation');
      session.setError(error.message);
      throw error;
    }
  }, [session]);
  
  /**
   * Add a message to the conversation
   */
  const addMessage = useCallback((message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);
  
  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  /**
   * Send audio data to the backend
   * @param audioBlob The recorded audio blob
   * @returns Promise that resolves when the audio is processed
   */
  const sendAudioData = useCallback(async (audioBlob: Blob): Promise<void> => {
    if (!audioBlob) {
      console.error('useConversation: No audio data to send');
      throw new Error('No audio data to send');
    }
    
    // Prevent duplicate processing
    if (isProcessingAudio || processingRef.current) {
      console.log('useConversation: Already processing audio, ignoring this request');
      return Promise.resolve(); 
    }
    
    // Ensure we have a session
    if (!session.sessionId) {
      console.log('useConversation: No session ID, creating new session before sending audio');
      await startConversation();
    }
    
    console.log(`useConversation: Sending audio data to session ${session.sessionId}`);
    
    try {
      setIsProcessingAudio(true);
      processingRef.current = true;
      
      // Update UI state to "thinking/processing"
      session.setStatus('processing');
      
      // Create placeholder user message (in real implementation, we'd get transcription from API)
      const userMessage: Message = {
        id: `user-msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sender: 'user',
        text: 'Processing your message...' // Will be updated with actual transcription
      };
      
      // Add user message to the local message state
      addMessage(userMessage);
      
      console.log(`useConversation: Calling sendAudio API with session ${session.sessionId}`);
      
      // Wait for API response
      const response = await sendAudio(session.sessionId!, audioBlob);
      latestMessageIdRef.current = response.messageId;
      
      console.log(`useConversation: Received API response with messageId: ${response.messageId}`);
      
      // Create AI message from response
      const aiMessage: Message = {
        id: response.messageId,
        timestamp: new Date().toISOString(),
        sender: 'ai',
        text: response.text,
        audioUrl: response.audioUrl
      };
      
      // Add AI message to the local message state
      addMessage(aiMessage);
      
      // Update status to start audio playback
      session.setStatus('responding');
      
      console.log('useConversation: Audio processing completed successfully');
      
      return Promise.resolve();
    } catch (err) {
      console.error('useConversation: Error processing audio', err);
      const error = err instanceof Error ? err : new Error('Unknown error processing audio');
      session.setError(error.message);
      session.setStatus('error');
      throw error;
    } finally {
      setIsProcessingAudio(false);
      processingRef.current = false;
    }
  }, [session, startConversation, addMessage]);
  
  /**
   * Fetches the conversation history for the current session
   */
  const fetchHistory = useCallback(async (): Promise<void> => {
    if (!session.sessionId) {
      console.warn('Cannot fetch history: No active session');
      return;
    }
    
    try {
      const response = await getHistory(session.sessionId);
      
      // Replace current messages with fetched history
      if (response.messages && response.messages.length > 0) {
        // Clear existing messages and add fetched ones
        setMessages(response.messages);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch conversation history');
      session.setError(error.message);
    }
  }, [session]);
  
  return {
    // Session state
    sessionId: session.sessionId,
    messages,
    status: session.status,
    error: session.error,
    
    // Processing state
    isProcessingAudio,
    
    // Actions
    sendAudioData,
    startConversation,
    endConversation,
    fetchHistory,
    addMessage,
    clearMessages,
    
    // Directly exposing session methods for convenience
    setError: session.setError,
    setStatus: session.setStatus
  };
} 