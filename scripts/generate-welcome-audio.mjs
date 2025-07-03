#!/usr/bin/env node

import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

// Welcome messages with call to action
const WELCOME_MESSAGES = [
  "Hey there, what's on your mind today? Click the button below to start talking to Kuku!",
  "Hello! I'm here to listen, what would you like to talk about? Just click the button below to start talking to Kuku!",
  "Hi! Ready to share what's going through your mind? Click the button below to start talking to Kuku!",
  "Welcome! What's been on your thoughts lately? Click the button below to start talking to Kuku!",
  "Good to see you! What would you like to explore today? Click the button below to start talking to Kuku!"
];

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set this environment variable
});

async function generateWelcomeAudio() {
  console.log('🎵 Generating welcome message audio files...');
  
  // Check if API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
    console.log('Please set your OpenAI API key:');
    console.log('Windows: set OPENAI_API_KEY=your_api_key_here');
    console.log('Mac/Linux: export OPENAI_API_KEY=your_api_key_here');
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), 'public', 'welcome-audio');
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`📁 Output directory ready: ${outputDir}`);
  } catch (error) {
    console.error('❌ Error creating output directory:', error);
    process.exit(1);
  }

  // Generate each welcome message
  for (let i = 0; i < WELCOME_MESSAGES.length; i++) {
    const message = WELCOME_MESSAGES[i];
    const filename = `welcome-${i + 1}.mp3`;
    const filepath = path.join(outputDir, filename);

    try {
      console.log(`🔊 Generating ${filename}...`);
      console.log(`📝 Message: "${message.substring(0, 50)}..."`);

      // Generate speech using OpenAI TTS
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy', // Can be: alloy, echo, fable, onyx, nova, shimmer
        input: message,
        speed: 1.0 // Normal speed
      });

      // Convert to buffer and save
      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.writeFile(filepath, buffer);

      console.log(`✅ Saved: ${filename} (${buffer.length} bytes)`);
    } catch (error) {
      console.error(`❌ Error generating ${filename}:`, error.message);
      process.exit(1);
    }
  }

  console.log('');
  console.log('🎉 All welcome message audio files generated successfully!');
  console.log(`📁 Files saved to: ${outputDir}`);
  console.log('');
  console.log('📋 Generated files:');
  for (let i = 1; i <= WELCOME_MESSAGES.length; i++) {
    console.log(`   - welcome-${i}.mp3`);
  }
  console.log('');
  console.log('🚀 Ready to implement welcome messages in the app!');
}

// Run the script
generateWelcomeAudio().catch(console.error); 