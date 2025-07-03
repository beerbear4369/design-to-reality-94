/**
 * API Client Types
 * Defines interfaces and types for the Think Clear API
 */

// Base API response type
export interface ApiResponse {
  success: boolean;
  error?: string;
}

// Session-related types
export interface SessionData {
  sessionId: string;
  createdAt: string;
  updatedAt?: string;
  status: 'active' | 'ended';
  messageCount?: number;
}

export interface SessionResponse extends ApiResponse {
  data?: SessionData;
}

export interface SummaryData {
  sessionId: string;
  summary: string;
  duration: number;
  messageCount: number;
}

export interface SummaryResponse extends ApiResponse {
  data?: SummaryData;
}

// Message-related types
export interface MessageData {
  id: string;
  timestamp: string;
  sender: 'user' | 'ai';
  text: string;
  audioUrl?: string;
}

// Backend integration types - simpler interface matching the actual backend
export interface ConversationMessage {
  id: string;
  timestamp: string;
  sender: 'user' | 'ai';
  text: string;
  audioUrl?: string;
}

export interface MessageResponse extends ApiResponse {
  data?: {
    messages: MessageData[];
    sessionEnded?: boolean;
    finalSummary?: string;
  };
}

export interface ConversationHistoryResponse extends ApiResponse {
  data?: {
    messages: MessageData[];
  };
}

// Authentication-related types
export interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserData;
}

export interface AuthResponse extends ApiResponse {
  data?: AuthData;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserProfileData {
  name?: string;
  email?: string;
  preferences?: Record<string, any>;
}

export interface UserResponse extends ApiResponse {
  data?: UserData;
}

// Configuration for API client
export interface ApiClientConfig {
  baseUrl: string;
  useMock: boolean;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  onAuthError?: () => void;
}

// Backend integration interface - simplified to match real backend
export interface BackendApiClient {
  createSession(): Promise<SessionData>;
  sendAudio(sessionId: string, audioBlob: Blob): Promise<{
    messages: ConversationMessage[];
    sessionEnded?: boolean;
    finalSummary?: string;
  }>;
  getMessages(sessionId: string): Promise<ConversationMessage[]>;
  healthCheck(): Promise<boolean>;
}

// Main API client interface (existing - kept for compatibility)
export interface ThinkClearApiClient {
  // Session Management
  createSession(): Promise<SessionResponse>;
  getSession(sessionId: string): Promise<SessionResponse>;
  endSession(sessionId: string): Promise<SummaryResponse>;
  
  // Conversation
  sendAudioMessage(sessionId: string, audioBlob: Blob): Promise<MessageResponse>;
  getConversationHistory(sessionId: string): Promise<ConversationHistoryResponse>;
  
  // Authentication
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<ApiResponse>;
  refreshToken(token: string): Promise<AuthResponse>;
  
  // User Management
  getCurrentUser(): Promise<UserResponse>;
  updateUserProfile(profileData: UserProfileData): Promise<UserResponse>;
}

// Factory function type
export type ApiClientFactory = (config: ApiClientConfig) => KukuCoachApiClient; 