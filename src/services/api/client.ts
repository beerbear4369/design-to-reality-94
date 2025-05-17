/**
 * API Client Factory
 * Creates and configures API clients for the application
 */

import { KukuCoachApiClient, ApiClientConfig, ApiClientFactory } from './types';
import { MockApiClient } from './mock/MockApiClient';

/**
 * Default API client configuration
 */
const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: '/api',
  useMock: true, // Default to mock in development
  timeout: 30000 // 30 seconds
};

/**
 * Creates an API client with the specified configuration
 */
export const createApiClient: ApiClientFactory = (config) => {
  // Merge with default config
  const mergedConfig: ApiClientConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  console.log(`Creating API client with config:`, {
    baseUrl: mergedConfig.baseUrl,
    useMock: mergedConfig.useMock,
    timeout: mergedConfig.timeout,
  });

  // For now, only return the mock client as we haven't implemented the real client yet
  return new MockApiClient(mergedConfig);

  // When real implementation is ready:
  // if (mergedConfig.useMock) {
  //   return new MockApiClient(mergedConfig);
  // }
  // return new RealApiClient(mergedConfig);
};

// Singleton instance with default config
let apiClientInstance: KukuCoachApiClient | null = null;

/**
 * Gets the singleton API client instance
 */
export const getApiClient = (): KukuCoachApiClient => {
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