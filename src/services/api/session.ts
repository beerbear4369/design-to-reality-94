/**
 * Session API Service
 * Handles REST API communication for the Kuku Coach application
 */

import { API_BASE_URL, fetchWithErrorHandling, delay } from './index';
import { saveConversation, getConversation, clearConversation } from '../storage/index';
import { synthesizeSpeech } from './audio';

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
}

export interface HistoryResponse {
  messages: Message[];
}

export interface EndSessionResponse {
  summaryText: string;
}

/**
 * Creates a new conversation session
 * @param existingSessionId Optional existing session ID to use
 * @returns Session ID for the new conversation
 */
export async function createSession(existingSessionId?: string): Promise<CreateSessionResponse> {
  // Simulate API delay
  await delay(500);
  
  // Use provided session ID or generate a new one
  const sessionId = existingSessionId || `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  console.log(`API: Creating session with ID: ${sessionId}`);
  
  // Create session in storage
  const newSession = {
    id: sessionId,
    messages: [],
    startTime: Date.now(),
    isActive: true
  };
  
  // First try to clear any existing session with this ID
  try {
    clearConversation(sessionId);
  } catch (err) {
    console.log(`No existing session to clear for ID: ${sessionId}`);
  }
  
  // Save to storage
  saveConversation(sessionId, newSession);
  
  // Verify it was saved correctly - try multiple times
  let savedSession = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    savedSession = getConversation(sessionId);
    if (savedSession) break;
    
    // If not saved, wait a bit and try again
    console.log(`API: Session not saved on attempt ${attempt + 1}, retrying...`);
    await delay(100);
    saveConversation(sessionId, newSession);
  }
  
  if (!savedSession) {
    console.error(`API: Failed to save new session after multiple attempts: ${sessionId}`);
    
    // Last resort: clear all session storage and try again
    clearSessionStorageItems();
    saveConversation(sessionId, newSession);
    
    // Final verification
    savedSession = getConversation(sessionId);
    if (!savedSession) {
      throw new Error("Failed to create session: Storage issue detected");
    }
  }
  
  console.log('API: Created and verified session:', sessionId, 'Session saved successfully');
  
  return { sessionId };
}

// Helper function to clear potential corrupted storage
function clearSessionStorageItems() {
  try {
    // Clear only session-related items
    const keys = Object.keys(localStorage);
    const sessionKeys = keys.filter(key => key.startsWith('kuku-coach:'));
    console.log('Clearing potentially corrupted session storage:', sessionKeys);
    sessionKeys.forEach(key => localStorage.removeItem(key));
  } catch (err) {
    console.error('Error clearing session storage:', err);
  }
}

/**
 * Sends audio to the backend and receives AI response
 * @param sessionId The current session ID
 * @param audioBlob The recorded audio blob
 * @returns AI response with text and audio URL
 */
export async function sendAudio(sessionId: string, audioBlob: Blob): Promise<SendAudioResponse> {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }
  
  if (!audioBlob) {
    throw new Error('Audio data is required');
  }
  
  console.log(`API: Sending audio for session: ${sessionId}`);
  
  // Get the current conversation from storage
  let conversation = getConversation(sessionId);
  
  // Handle missing session
  if (!conversation) {
    console.error(`API: Session ${sessionId} not found in storage`);
    
    // Create a new session through the proper creation flow
    console.log('API: Creating session as it was not found');
    try {
      const response = await createSession(sessionId);
      conversation = getConversation(sessionId);
      
      if (!conversation) {
        throw new Error('Session creation failed');
      }
      
      console.log('API: Successfully created session');
    } catch (err) {
      console.error('API: Failed to create session:', err);
      throw new Error(`Session ${sessionId} not found and could not be created`);
    }
  }
  
  // Simulate API delay for transcription (1-2 seconds)
  await delay(1000 + Math.random() * 1000);
  
  // Mock transcription - in a real implementation this would be done on the backend
  const mockUserMessages = [
    "I'm feeling really overwhelmed with work lately.",
    "I don't know how to handle the pressure from my boss.",
    "Sometimes I feel like I'm not making progress.",
    "I've been having trouble sleeping because of stress.",
    "I need help managing my anxiety during presentations.",
  ];
  const userText = mockUserMessages[Math.floor(Math.random() * mockUserMessages.length)];
  
  // Get the session again (original or fallback) - no need to check again since we've verified it exists
  const sessionData = conversation;
  
  // Add user message to conversation
  const userMessage = {
    id: `user-${Date.now()}`,
    role: 'user',
    content: userText,
    timestamp: Date.now()
  };
  
  // Update session with new message
  const updatedSession = {
    ...sessionData,
    messages: [...(sessionData.messages || []), userMessage]
  };
  
  saveConversation(sessionId, updatedSession);
  
  // Simulate processing time for AI response (2-3 seconds)
  await delay(2000 + Math.random() * 1000);
  
  // Mock AI response
  const mockAIResponses = [
    "It sounds like you're experiencing significant work stress. Let's explore some strategies to manage that overwhelming feeling. Could you tell me more about what specific aspects of work are causing the most stress?",
    "I understand how difficult it can be when you feel pressured at work. Let's break down what's happening with your boss and explore some communication techniques that might help improve the situation.",
    "Feeling stuck or stagnant can be frustrating. Let's talk about how you measure progress and what realistic expectations might look like in your current situation.",
    "Sleep problems are often connected to our daily stress. Let's explore both your bedtime routine and your daytime stress management to see if we can improve your sleep quality.",
    "Presentation anxiety is very common. Let's work through some preparation techniques and mindfulness exercises that can help you feel more confident and centered during presentations."
  ];
  
  const aiText = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
  const messageId = `ai-${Date.now()}`;
  
  // Generate audio URL for the response
  const { audioUrl } = await synthesizeSpeech(aiText);
  
  // Add AI message to conversation
  const aiMessage = {
    id: messageId,
    role: 'ai',
    content: aiText,
    timestamp: Date.now(),
    audioUrl
  };
  
  // Update session with new AI message
  const updatedSessionWithAI = {
    ...updatedSession,
    messages: [...updatedSession.messages, aiMessage]
  };
  
  saveConversation(sessionId, updatedSessionWithAI);
  
  // Return the AI response
  return {
    messageId,
    text: aiText,
    audioUrl
  };
}

/**
 * Retrieves conversation history for a session
 * @param sessionId The session ID
 * @returns Array of messages in the conversation
 */
export async function getHistory(sessionId: string): Promise<HistoryResponse> {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }
  
  // Simulate API delay
  await delay(300);
  
  // Get from storage
  const conversation = getConversation(sessionId);
  
  if (!conversation) {
    throw new Error(`Session ${sessionId} not found`);
  }
  
  // Convert storage format to SessionContext format
  const messages: Message[] = conversation.messages.map(msg => ({
    id: msg.id,
    timestamp: new Date(msg.timestamp).toISOString(),
    sender: msg.role === 'user' ? 'user' : 'ai',
    text: msg.content,
    audioUrl: msg.audioUrl
  }));
  
  return { messages };
}

/**
 * Ends the current session and generates a summary
 * @param sessionId The session ID
 * @returns Session summary data
 */
export async function endSession(sessionId: string): Promise<EndSessionResponse> {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }
  
  // Simulate API delay
  await delay(1000);
  
  // Get from storage
  const conversation = getConversation(sessionId);
  
  if (!conversation) {
    throw new Error(`Session ${sessionId} not found`);
  }
  
  // Mark as inactive and add end time
  conversation.isActive = false;
  conversation.endTime = Date.now();
  
  // Generate summary
  const summaryText = generateMockSummary(conversation);
  conversation.summary = summaryText;
  
  // Save updated conversation
  saveConversation(sessionId, conversation);
  
  return { summaryText };
}

/**
 * Generates a mock summary for the conversation
 * @param conversation The conversation data
 * @returns Generated summary
 */
function generateMockSummary(conversation: any): string {
  const messageCount = conversation.messages.length;
  const duration = Math.round((Date.now() - conversation.startTime) / 60000); // in minutes
  
  const summaries = [
    `Great session with ${messageCount} exchanges over ${duration} minutes. You discussed your recent challenges and explored potential solutions.`,
    `Productive ${duration}-minute session focused on identifying stress triggers and developing coping mechanisms. Good progress!`,
    `This ${duration}-minute conversation covered your goals and obstacles. We identified key patterns to work on in future sessions.`,
    `Insightful ${duration}-minute session with ${messageCount} messages exchanged. You showed great self-awareness about your current struggles.`
  ];
  
  // Select a random summary
  return summaries[Math.floor(Math.random() * summaries.length)];
} 