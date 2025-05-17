/**
 * Mock AI responses for development testing
 * 
 * This simulates a backend API that returns both text and audio responses
 */

import { generateBeepWav, generateSequence } from "@/services/audio-generator";

// Sample AI response texts
const responseTexts = [
  "I understand you want to discuss that topic. Could you tell me more about what specific aspects are most important to you?",
  "That's an interesting perspective. How long have you been thinking about this, and what steps have you already taken?",
  "It sounds like this has been on your mind for a while. What would you consider a successful outcome for this situation?",
  "I hear your concerns. Let's break this down into smaller parts so we can address each one. What feels most urgent to you?",
  "Thank you for sharing that with me. Based on what you've said, it seems like you're looking for clarity. Is that accurate?"
];

// Generate different WAV audio tones for responses
function generateResponseAudio(index: number): string {
  // Generate different audio patterns based on the response index
  switch (index % 5) {
    case 0:
      // Simple beep
      return generateBeepWav(1.0, 440, 0.4);
    case 1:
      // Two-tone descending
      return generateSequence([
        { freq: 880, duration: 0.3 },
        { freq: 660, duration: 0.5 }
      ], 0.4);
    case 2:
      // Rising sequence
      return generateSequence([
        { freq: 330, duration: 0.3 },
        { freq: 440, duration: 0.3 },
        { freq: 550, duration: 0.4 }
      ], 0.4);
    case 3:
      // Question-like pattern
      return generateSequence([
        { freq: 440, duration: 0.3 },
        { freq: 550, duration: 0.6 }
      ], 0.4);
    case 4:
      // Confirmation pattern
      return generateSequence([
        { freq: 660, duration: 0.2 },
        { freq: 880, duration: 0.4 }
      ], 0.4);
    default:
      return generateBeepWav();
  }
}

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
  
  // Generate an audio response based on the text index
  const audioUrl = generateResponseAudio(randomTextIndex);
  
  console.log(`AI Response generated: "${text.substring(0, 30)}..." with audio URL`);
  
  return {
    text,
    audioUrl
  };
} 