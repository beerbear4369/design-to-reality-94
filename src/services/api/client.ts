/**
 * API Client Factory
 * Creates and configures API clients for the application
 * SIMPLIFIED: Only supports real backend API
 */

import { ApiClientConfig } from './types';
import { RealApiClient } from './real/RealApiClient';

/**
 * Default API client configuration for real backend
 */
const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: 'http://localhost:8000/api',
  useMock: false,
  timeout: 30000
};

/**
 * Creates a real backend API client
 * SIMPLIFIED: No more mock fallback or complex adapters
 */
export const createApiClient = (config?: Partial<ApiClientConfig>): RealApiClient => {
  // Merge with default config
  const mergedConfig: ApiClientConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  console.log(`Creating real backend API client:`, {
    baseUrl: mergedConfig.baseUrl,
    timeout: mergedConfig.timeout,
  });

  return new RealApiClient(mergedConfig);
};

// Singleton instance with default config
let apiClientInstance: RealApiClient | null = null;

/**
 * Gets the singleton API client instance
 */
export const getApiClient = (): RealApiClient => {
  if (!apiClientInstance) {
    apiClientInstance = createApiClient(DEFAULT_CONFIG);
  }
  return apiClientInstance;
};

/**
 * Resets the API client instance - useful for testing
 */
export const resetApiClient = (config?: Partial<ApiClientConfig>): void => {
  apiClientInstance = createApiClient({
    ...DEFAULT_CONFIG,
    ...config
  });
}; 