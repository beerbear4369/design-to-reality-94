/**
 * Audio API Service
 * Handles audio transcription and speech synthesis with mock implementation
 */

import { API_BASE_URL, fetchWithErrorHandling, delay } from './index';

// Types
export interface TranscriptionResult {
  text: string;
  confidence: number;
}

export interface SynthesisResult {
  audioUrl: string;
}

// Mock responses for transcription
const mockTranscriptions = [
  "I'm feeling really overwhelmed with work lately.",
  "I don't know how to handle the pressure from my boss.",
  "Sometimes I feel like I'm not making progress.",
  "I've been having trouble sleeping because of stress.",
  "I need help managing my anxiety during presentations.",
  "How can I improve my work-life balance?",
  "I'm struggling with motivation in the mornings.",
  "My team doesn't seem to understand my communication style.",
  "I feel stuck in my career and don't know what to do next.",
  "I'm having conflicts with a colleague and it's affecting my mood."
];

// Mock audio URLs for synthesis (in a real app, these would point to actual audio files)
const mockAudioUrls = [
  '/mock-audio/response-1.mp3',
  '/mock-audio/response-2.mp3',
  '/mock-audio/response-3.mp3',
  '/mock-audio/response-4.mp3',
  '/mock-audio/response-5.mp3'
];

/**
 * Simulates audio transcription
 * @param audioBlob Recorded audio blob
 * @returns Transcription result with text and confidence
 */
export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
  // Simulate processing time (1-2 seconds)
  await delay(1000 + Math.random() * 1000);
  
  // For mock purposes, we'll ignore the actual audio content
  // and return a random predefined transcription
  
  return {
    text: mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)],
    confidence: 0.7 + (Math.random() * 0.3) // Random confidence between 0.7 and 1.0
  };
}

/**
 * Simulates text-to-speech synthesis
 * @param text Text to convert to speech
 * @returns Synthesis result with audio URL
 */
export async function synthesizeSpeech(text: string): Promise<SynthesisResult> {
  // Simulate processing time
  await delay(800 + Math.random() * 700);
  
  // For mock purposes, return a random audio URL
  return {
    audioUrl: mockAudioUrls[Math.floor(Math.random() * mockAudioUrls.length)]
  };
} 