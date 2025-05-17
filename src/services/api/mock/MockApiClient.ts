/**
 * Mock API Client
 * Implements the KukuCoachApiClient interface for local development and testing
 */

import { delay } from '../index';
import { 
  KukuCoachApiClient, 
  ApiClientConfig,
  SessionResponse,
  SummaryResponse,
  MessageResponse,
  ConversationHistoryResponse,
  LoginCredentials,
  AuthResponse,
  ApiResponse,
  UserProfileData,
  UserResponse,
  MessageData
} from '../types';

// Local storage keys for persistence
const STORAGE_PREFIX = 'kuku-coach:';
const SESSIONS_KEY = `${STORAGE_PREFIX}sessions`;
const AUTH_KEY = `${STORAGE_PREFIX}auth`;

// Mock data generation helpers
const generateId = (prefix: string): string => 
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const getMockAudioUrl = (): string => {
  const audioNumber = Math.floor(Math.random() * 5) + 1;
  return `/mock-audio/response-${audioNumber}.mp3`;
};

const getMockUserMessage = (): string => {
  const mockUserMessages = [
    "I'm feeling really overwhelmed with work lately.",
    "I don't know how to handle the pressure from my boss.",
    "Sometimes I feel like I'm not making progress.",
    "I've been having trouble sleeping because of stress.",
    "I need help managing my anxiety during presentations.",
  ];
  return mockUserMessages[Math.floor(Math.random() * mockUserMessages.length)];
};

const getMockAIResponse = (): string => {
  const mockAIResponses = [
    "It sounds like you're experiencing significant work stress. Let's explore some strategies to manage that overwhelming feeling. Could you tell me more about what specific aspects of work are causing the most stress?",
    "I understand how difficult it can be when you feel pressured at work. Let's break down what's happening with your boss and explore some communication techniques that might help improve the situation.",
    "Feeling stuck or stagnant can be frustrating. Let's talk about how you measure progress and what realistic expectations might look like in your current situation.",
    "Sleep problems are often connected to our daily stress. Let's explore both your bedtime routine and your daytime stress management to see if we can improve your sleep quality.",
    "Presentation anxiety is very common. Let's work through some preparation techniques and mindfulness exercises that can help you feel more confident and centered during presentations."
  ];
  return mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
};

// Storage helpers
const getSessions = (): Record<string, any> => {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting sessions from storage:', error);
    return {};
  }
};

const saveSession = (sessionId: string, data: any): void => {
  try {
    const sessions = getSessions();
    sessions[sessionId] = data;
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving session to storage:', error);
  }
};

const getSession = (sessionId: string): any => {
  const sessions = getSessions();
  return sessions[sessionId];
};

export class MockApiClient implements KukuCoachApiClient {
  private config: ApiClientConfig;
  private isAuthenticated: boolean = false;
  private currentUser: any = null;
  
  constructor(config: ApiClientConfig) {
    this.config = config;
    
    // Check for existing authentication
    try {
      const authData = localStorage.getItem(AUTH_KEY);
      if (authData) {
        const parsed = JSON.parse(authData);
        this.isAuthenticated = true;
        this.currentUser = parsed.user;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
    
    console.log('MockApiClient initialized with config:', config);
  }
  
  // SESSION MANAGEMENT
  
  async createSession(): Promise<SessionResponse> {
    await delay(500); // Simulate network delay
    
    const sessionId = generateId('session');
    const createdAt = new Date().toISOString();
    
    const sessionData = {
      sessionId,
      createdAt,
      updatedAt: createdAt,
      status: 'active' as const,
      messageCount: 0,
      messages: []
    };
    
    saveSession(sessionId, sessionData);
    
    console.log('MockApiClient: Created session', sessionId);
    
    return {
      success: true,
      data: {
        sessionId,
        createdAt,
        status: 'active',
        messageCount: 0
      }
    };
  }
  
  async getSession(sessionId: string): Promise<SessionResponse> {
    await delay(300);
    
    const sessionData = getSession(sessionId);
    
    if (!sessionData) {
      return {
        success: false,
        error: `Session not found: ${sessionId}`
      };
    }
    
    return {
      success: true,
      data: {
        sessionId: sessionData.sessionId,
        createdAt: sessionData.createdAt,
        updatedAt: sessionData.updatedAt,
        status: sessionData.status,
        messageCount: sessionData.messages?.length || 0
      }
    };
  }
  
  async endSession(sessionId: string): Promise<SummaryResponse> {
    await delay(800);
    
    const sessionData = getSession(sessionId);
    
    if (!sessionData) {
      return {
        success: false,
        error: `Session not found: ${sessionId}`
      };
    }
    
    // Generate a simple summary based on the conversation
    const summary = this.generateMockSummary(sessionData);
    
    // Calculate duration
    const startTime = new Date(sessionData.createdAt).getTime();
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000); // in seconds
    
    // Update session status
    sessionData.status = 'ended';
    sessionData.updatedAt = new Date().toISOString();
    saveSession(sessionId, sessionData);
    
    return {
      success: true,
      data: {
        sessionId,
        summary,
        duration,
        messageCount: sessionData.messages?.length || 0
      }
    };
  }
  
  // CONVERSATION
  
  async sendAudioMessage(sessionId: string, audioBlob: Blob): Promise<MessageResponse> {
    if (!audioBlob) {
      return {
        success: false,
        error: 'Audio data is required'
      };
    }
    
    // Get session
    let sessionData = getSession(sessionId);
    
    if (!sessionData) {
      // Create session if it doesn't exist
      const newSessionResponse = await this.createSession();
      
      if (!newSessionResponse.success) {
        return {
          success: false,
          error: 'Failed to create session'
        };
      }
      
      sessionId = newSessionResponse.data?.sessionId || sessionId;
      sessionData = getSession(sessionId);
    }
    
    // Simulate transcription delay
    await delay(1000 + Math.random() * 1000);
    
    // Create user message
    const userMessageId = generateId('user-msg');
    const userMessage: MessageData = {
      id: userMessageId,
      timestamp: new Date().toISOString(),
      sender: 'user',
      text: getMockUserMessage()
    };
    
    // Add to session data
    if (!sessionData.messages) {
      sessionData.messages = [];
    }
    sessionData.messages.push(userMessage);
    
    // Simulate processing delay
    await delay(1500 + Math.random() * 1000);
    
    // Generate AI response
    const aiMessageId = generateId('ai-msg');
    const aiMessage: MessageData = {
      id: aiMessageId,
      timestamp: new Date().toISOString(),
      sender: 'ai',
      text: getMockAIResponse(),
      audioUrl: getMockAudioUrl()
    };
    
    // Add to session data
    sessionData.messages.push(aiMessage);
    sessionData.messageCount = sessionData.messages.length;
    sessionData.updatedAt = new Date().toISOString();
    
    // Save updated session
    saveSession(sessionId, sessionData);
    
    return {
      success: true,
      data: {
        messages: [userMessage, aiMessage]
      }
    };
  }
  
  async getConversationHistory(sessionId: string): Promise<ConversationHistoryResponse> {
    await delay(500);
    
    const sessionData = getSession(sessionId);
    
    if (!sessionData) {
      return {
        success: false,
        error: `Session not found: ${sessionId}`
      };
    }
    
    return {
      success: true,
      data: {
        messages: sessionData.messages || []
      }
    };
  }
  
  // AUTHENTICATION
  
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800);
    
    // Very simple mock authentication - in a real app, this would validate against a backend
    if (credentials.email && credentials.password) {
      const userData = {
        id: 'user-mock-1',
        email: credentials.email,
        name: 'Mock User',
        role: 'user'
      };
      
      const authData = {
        accessToken: `mock-access-token-${Date.now()}`,
        refreshToken: `mock-refresh-token-${Date.now()}`,
        expiresIn: 3600,
        user: userData
      };
      
      // Store in local storage
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      
      this.isAuthenticated = true;
      this.currentUser = userData;
      
      return {
        success: true,
        data: authData
      };
    }
    
    return {
      success: false,
      error: 'Invalid credentials'
    };
  }
  
  async logout(): Promise<ApiResponse> {
    await delay(300);
    
    // Clear auth data
    localStorage.removeItem(AUTH_KEY);
    
    this.isAuthenticated = false;
    this.currentUser = null;
    
    return {
      success: true
    };
  }
  
  async refreshToken(token: string): Promise<AuthResponse> {
    await delay(500);
    
    try {
      const authData = localStorage.getItem(AUTH_KEY);
      
      if (!authData) {
        return {
          success: false,
          error: 'No authentication data found'
        };
      }
      
      const parsed = JSON.parse(authData);
      
      // In a real app, would validate the refresh token
      if (parsed.refreshToken) {
        const newAuthData = {
          ...parsed,
          accessToken: `mock-access-token-${Date.now()}`,
          expiresIn: 3600
        };
        
        localStorage.setItem(AUTH_KEY, JSON.stringify(newAuthData));
        
        return {
          success: true,
          data: newAuthData
        };
      }
      
      return {
        success: false,
        error: 'Invalid refresh token'
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      return {
        success: false,
        error: 'Error refreshing token'
      };
    }
  }
  
  // USER MANAGEMENT
  
  async getCurrentUser(): Promise<UserResponse> {
    await delay(300);
    
    if (this.isAuthenticated && this.currentUser) {
      return {
        success: true,
        data: this.currentUser
      };
    }
    
    return {
      success: false,
      error: 'Not authenticated'
    };
  }
  
  async updateUserProfile(profileData: UserProfileData): Promise<UserResponse> {
    await delay(700);
    
    if (!this.isAuthenticated || !this.currentUser) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
    
    try {
      const authData = localStorage.getItem(AUTH_KEY);
      
      if (!authData) {
        return {
          success: false,
          error: 'Authentication data not found'
        };
      }
      
      const parsed = JSON.parse(authData);
      
      // Update user data
      const updatedUser = {
        ...parsed.user,
        ...profileData
      };
      
      // Update auth data
      const updatedAuthData = {
        ...parsed,
        user: updatedUser
      };
      
      localStorage.setItem(AUTH_KEY, JSON.stringify(updatedAuthData));
      
      this.currentUser = updatedUser;
      
      return {
        success: true,
        data: updatedUser
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: 'Error updating profile'
      };
    }
  }
  
  // HELPER METHODS
  
  private generateMockSummary(sessionData: any): string {
    const messages = sessionData.messages || [];
    const userMessages = messages.filter((msg: any) => msg.sender === 'user');
    const aiMessages = messages.filter((msg: any) => msg.sender === 'ai');
    
    if (messages.length === 0) {
      return "No conversation took place in this session.";
    }
    
    // Simple summary generator
    return `In this coaching session, we discussed ${userMessages.length} topics related to stress and anxiety management. 
    The conversation focused on workplace challenges and strategies for managing them effectively. 
    Key recommendations included mindfulness practices, communication techniques, and developing healthy work boundaries.`;
  }
} 