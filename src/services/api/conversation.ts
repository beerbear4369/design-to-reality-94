/**
 * Conversation API Service
 * Handles conversation session management with mock implementation
 */

import { API_BASE_URL, fetchWithErrorHandling, delay } from './index';
import { saveConversation, getConversation } from '../storage/index';

// Types
export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  audioUrl?: string;
}

export interface Conversation {
  id: string;
  messages: Message[];
  startTime: number;
  endTime?: number;
  summary?: string;
  isActive: boolean;
}

/**
 * Creates a new conversation session
 * @returns Created conversation object with ID
 */
export async function createSession(): Promise<Conversation> {
  // Simulate API delay
  await delay(500);
  
  // Create a new conversation with unique ID
  const newConversation: Conversation = {
    id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
    messages: [],
    startTime: Date.now(),
    isActive: true,
  };
  
  // Save to storage
  saveConversation(newConversation.id, newConversation);
  
  // Return new conversation
  return newConversation;
}

/**
 * Retrieves a conversation by ID
 * @param id Conversation ID
 * @returns Conversation object
 */
export async function getConversationById(id: string): Promise<Conversation> {
  // Simulate API delay
  await delay(300);
  
  // Get from storage
  const conversation = getConversation(id);
  
  if (!conversation) {
    throw new Error(`Conversation with ID ${id} not found`);
  }
  
  return conversation;
}

/**
 * Ends an active conversation session and generates summary
 * @param id Conversation ID
 * @returns Updated conversation with summary
 */
export async function endSession(id: string): Promise<Conversation> {
  // Simulate API delay
  await delay(1000);
  
  // Get current conversation
  const conversation = getConversation(id);
  
  if (!conversation) {
    throw new Error(`Conversation with ID ${id} not found`);
  }
  
  if (!conversation.isActive) {
    throw new Error(`Conversation with ID ${id} is already ended`);
  }
  
  // Update conversation
  const updatedConversation: Conversation = {
    ...conversation,
    endTime: Date.now(),
    isActive: false,
    summary: generateMockSummary(conversation),
  };
  
  // Save updated conversation
  saveConversation(id, updatedConversation);
  
  return updatedConversation;
}

/**
 * Simple mock function to generate a summary based on conversation
 * @param conversation Conversation to summarize
 * @returns Generated summary text
 */
function generateMockSummary(conversation: Conversation): string {
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