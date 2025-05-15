/**
 * API Service Index
 * Central configuration for API services
 */

// Base API configuration
export const API_BASE_URL = '/api';

// Request headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Common fetch wrapper with error handling
export async function fetchWithErrorHandling<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    // Merge default headers with provided options
    const mergedOptions = {
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        ...(options.headers || {}),
      },
    };

    const response = await fetch(url, mergedOptions);
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
}

// Timeout utility for simulating network delays
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 