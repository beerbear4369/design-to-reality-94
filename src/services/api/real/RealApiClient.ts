/**
 * Real API Client
 * Implements the KukuCoachApiClient interface for production use with a real backend
 */

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
  UserResponse
} from '../types';

// Authentication token management
const TOKEN_REFRESH_BUFFER = 60000; // 1 minute before token expiry
const AUTH_STORAGE_KEY = 'kuku-coach-auth';

export class RealApiClient implements KukuCoachApiClient {
  private config: ApiClientConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshPromise: Promise<AuthResponse> | null = null;
  
  constructor(config: ApiClientConfig) {
    this.config = config;
    
    // Try to get authentication from storage
    this.loadAuthFromStorage();
    
    console.log('RealApiClient initialized with config:', {
      ...config,
      useMock: config.useMock,
      // Don't log sensitive headers
      defaultHeaders: config.defaultHeaders ? 'Custom headers provided' : 'Default headers'
    });
  }
  
  // API Request Handling
  
  /**
   * Makes an authenticated API request
   */
  private async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any,
    isAuthEndpoint: boolean = false
  ): Promise<T> {
    // Build full URL
    const url = this.buildUrl(endpoint);
    
    // Get headers
    const headers = await this.getHeaders(isAuthEndpoint);
    
    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
      credentials: 'include', // For cookies (refresh token)
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      // Handle FormData separately
      if (data instanceof FormData) {
        options.body = data;
        // Remove Content-Type header; browser will set it with boundary
        delete (options.headers as Record<string, string>)['Content-Type'];
      } else {
        options.body = JSON.stringify(data);
      }
    }
    
    try {
      // Make the request
      const response = await fetch(url, options);
      
      // If unauthorized and not already an auth endpoint, try to refresh token
      if (response.status === 401 && !isAuthEndpoint) {
        // Try token refresh
        const refreshed = await this.refreshTokenIfNeeded(true);
        
        if (refreshed) {
          // Retry the request with new token
          return this.request<T>(endpoint, method, data, isAuthEndpoint);
        } else {
          // Refresh failed, throw error
          throw new Error('Authentication failed');
        }
      }
      
      // For JSON responses
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        const json = await response.json();
        
        if (!response.ok) {
          throw new Error(json.error || `API Error: ${response.status}`);
        }
        
        return json as T;
      } else {
        // Non-JSON response
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        // Return raw response for other content types
        return response as unknown as T;
      }
    } catch (error) {
      console.error(`API Request Failed (${method} ${endpoint}):`, error);
      
      // Call onAuthError if it's an auth error
      if (
        error instanceof Error && 
        error.message.includes('Authentication failed') && 
        this.config.onAuthError
      ) {
        this.config.onAuthError();
      }
      
      throw error;
    }
  }
  
  /**
   * Builds a full URL from an endpoint
   */
  private buildUrl(endpoint: string): string {
    let baseUrl = this.config.baseUrl || '';
    
    // Remove trailing slash from base URL if present
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    // Add leading slash to endpoint if missing
    if (!endpoint.startsWith('/')) {
      endpoint = `/${endpoint}`;
    }
    
    return `${baseUrl}${endpoint}`;
  }
  
  /**
   * Gets headers for API requests, including auth token
   */
  private async getHeaders(isAuthEndpoint: boolean = false): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.config.defaultHeaders || {})
    };
    
    // Don't add auth headers for auth endpoints to avoid circular dependencies
    if (!isAuthEndpoint) {
      // Check if token needs refresh
      await this.refreshTokenIfNeeded();
      
      // Add authorization header if we have a token
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }
    }
    
    return headers;
  }
  
  // Authentication Helpers
  
  /**
   * Loads authentication data from storage
   */
  private loadAuthFromStorage(): void {
    try {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      
      if (authData) {
        const parsed = JSON.parse(authData);
        
        this.accessToken = parsed.accessToken;
        this.refreshToken = parsed.refreshToken;
        
        // Calculate expiry time
        if (parsed.expiresAt) {
          this.tokenExpiry = parsed.expiresAt;
        } else if (parsed.expiresIn) {
          // Calculate expiry from expiresIn
          this.tokenExpiry = Date.now() + (parsed.expiresIn * 1000);
        }
      }
    } catch (error) {
      console.error('Error loading auth from storage:', error);
      this.clearAuthData();
    }
  }
  
  /**
   * Saves authentication data to storage
   */
  private saveAuthToStorage(authData: AuthResponse): void {
    if (!authData.data) return;
    
    try {
      const { accessToken, refreshToken, expiresIn, user } = authData.data;
      
      // Calculate absolute expiry time
      const expiresAt = Date.now() + (expiresIn * 1000);
      
      // Update instance variables
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.tokenExpiry = expiresAt;
      
      // Save to storage
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        accessToken,
        refreshToken,
        expiresAt,
        user
      }));
    } catch (error) {
      console.error('Error saving auth to storage:', error);
    }
  }
  
  /**
   * Clears all authentication data
   */
  private clearAuthData(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
  
  /**
   * Refreshes the access token if needed
   * @param force Force refresh even if not expired
   * @returns True if token was refreshed or valid, false if refresh failed
   */
    private async refreshTokenIfNeeded(force: boolean = false): Promise<boolean> {    // If no refresh token, no need to continue    if (!this.refreshToken) {      return false;    }        // Check if token is still valid    const now = Date.now();        // Only refresh if forcing or token is expiring soon    if (!force && this.tokenExpiry && this.tokenExpiry - now > TOKEN_REFRESH_BUFFER) {      return true; // Token still valid    }        // Refresh is needed - use existing refresh promise if one is in progress    if (!this.refreshPromise) {      this.refreshPromise = this.doRefreshToken(this.refreshToken);    }
    
    try {
      const result = await this.refreshPromise;
      
      if (result.success && result.data) {
        // Token refresh successful
        this.saveAuthToStorage(result);
        return true;
      } else {
        // Refresh failed, clear auth data
        this.clearAuthData();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuthData();
      return false;
    } finally {
      // Clear the refresh promise regardless of outcome
      this.refreshPromise = null;
    }
  }
  
  // SESSION MANAGEMENT
  
  async createSession(): Promise<SessionResponse> {
    return this.request<SessionResponse>('/sessions', 'POST');
  }
  
  async getSession(sessionId: string): Promise<SessionResponse> {
    return this.request<SessionResponse>(`/sessions/${sessionId}`);
  }
  
  async endSession(sessionId: string): Promise<SummaryResponse> {
    return this.request<SummaryResponse>(`/sessions/${sessionId}/end`, 'POST');
  }
  
  // CONVERSATION
  
  async sendAudioMessage(sessionId: string, audioBlob: Blob): Promise<MessageResponse> {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    return this.request<MessageResponse>(`/sessions/${sessionId}/messages`, 'POST', formData);
  }
  
  async getConversationHistory(sessionId: string): Promise<ConversationHistoryResponse> {
    return this.request<ConversationHistoryResponse>(`/sessions/${sessionId}/messages`);
  }
  
  // AUTHENTICATION
  
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', 'POST', credentials, true);
    
    if (response.success && response.data) {
      // Save auth data
      this.saveAuthToStorage(response);
    }
    
    return response;
  }
  
  async logout(): Promise<ApiResponse> {
    // Attempt to call logout API
    try {
      const response = await this.request<ApiResponse>('/auth/logout', 'POST');
      
      // Always clear auth data, even if API call fails
      this.clearAuthData();
      
      return response;
    } catch (error) {
      // Clear auth data even on error
      this.clearAuthData();
      
      // Return error response
      return {
        success: false,
        error: 'Logout failed'
      };
    }
  }
  
    async refreshToken(token: string): Promise<AuthResponse> {    return this.doRefreshToken(token);  }    /**   * Internal method to refresh token to avoid name conflict with interface method   */  private async doRefreshToken(token: string): Promise<AuthResponse> {    return this.request<AuthResponse>('/auth/refresh', 'POST', { refreshToken: token }, true);  }
  
  // USER MANAGEMENT
  
  async getCurrentUser(): Promise<UserResponse> {
    return this.request<UserResponse>('/users/me');
  }
  
  async updateUserProfile(profileData: UserProfileData): Promise<UserResponse> {
    return this.request<UserResponse>('/users/me', 'PATCH', profileData);
  }
} 