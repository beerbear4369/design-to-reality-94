/**
 * Mock Delays
 * Simulates network and processing delays for mock services
 */

// Delay ranges in milliseconds
export const DELAY_RANGES = {
  // Network-related delays
  CONNECTION: { min: 200, max: 500 },
  API_REQUEST: { min: 300, max: 800 },
  WEBSOCKET_EVENT: { min: 50, max: 150 },
  
  // Processing-related delays
  TRANSCRIPTION: { min: 800, max: 1500 },
  THINKING: { min: 1800, max: 2200 }, // AI thinking delay (around 2 seconds)
  SPEECH_SYNTHESIS: { min: 600, max: 1000 },
  
  // User experience delays
  TYPING_ANIMATION: { min: 15, max: 40 }, // Per character
};

/**
 * Generates a random delay within the specified range
 * @param min Minimum delay in milliseconds
 * @param max Maximum delay in milliseconds
 * @returns Random delay value
 */
export function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a delay value for the specified operation
 * @param operation The operation to get a delay for
 * @returns Delay in milliseconds
 */
export function getOperationDelay(operation: keyof typeof DELAY_RANGES): number {
  const range = DELAY_RANGES[operation];
  return getRandomDelay(range.min, range.max);
}

/**
 * Waits for the specified delay
 * @param operation The operation to wait for
 * @returns Promise that resolves after the delay
 */
export async function waitFor(operation: keyof typeof DELAY_RANGES): Promise<void> {
  const delay = getOperationDelay(operation);
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Calculates a typing animation delay based on text length
 * @param text The text to calculate delay for
 * @returns Delay in milliseconds
 */
export function getTypingDelay(text: string): number {
  const { min, max } = DELAY_RANGES.TYPING_ANIMATION;
  const perCharacter = getRandomDelay(min, max);
  
  // Base delay plus per-character delay
  return 200 + (text.length * perCharacter);
} 