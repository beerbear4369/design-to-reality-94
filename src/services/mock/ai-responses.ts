/**
 * Mock AI responses for development testing
 * 
 * This simulates a backend API that returns both text and audio responses
 */

// Sample AI response texts
const responseTexts = [
  "I understand you want to discuss that topic. Could you tell me more about what specific aspects are most important to you?",
  "That's an interesting perspective. How long have you been thinking about this, and what steps have you already taken?",
  "It sounds like this has been on your mind for a while. What would you consider a successful outcome for this situation?",
  "I hear your concerns. Let's break this down into smaller parts so we can address each one. What feels most urgent to you?",
  "Thank you for sharing that with me. Based on what you've said, it seems like you're looking for clarity. Is that accurate?"
];

// Mock audio files that would be returned from a real backend
const mockAudioFiles = [
  '/mock-audio/response-1.mp3',
  '/mock-audio/response-2.mp3',
  '/mock-audio/response-3.mp3',
  '/mock-audio/response-4.mp3',
  '/mock-audio/response-5.mp3'
];

/**
 * Simulates an AI response from the backend
 * In a real implementation, this would be an API call
 */
export async function getAIResponse(userMessage: string): Promise<{text: string, audioUrl: string}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Pick a random text response
  const randomTextIndex = Math.floor(Math.random() * responseTexts.length);
  const text = responseTexts[randomTextIndex];
  
  // Pick a corresponding audio response
  // In a real implementation, this would be an actual audio file generated on the backend
  const audioIndex = randomTextIndex % mockAudioFiles.length;
  const audioUrl = mockAudioFiles[audioIndex];
  
  console.log(`AI Response generated with mock backend API`);
  console.log(`Text: "${text.substring(0, 30)}..."`);
  console.log(`Audio URL: ${audioUrl}`);
  
  return {
    text,
    audioUrl
  };
} 