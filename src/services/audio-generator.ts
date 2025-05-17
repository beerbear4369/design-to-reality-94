/**
 * Audio generator utility
 * Creates audio responses using Web Audio API
 */

// Store created URLs for cleanup
const createdUrls: string[] = [];

/**
 * Generates speech-like audio using oscillators
 * @param text The text that would be spoken (used to determine audio length)
 * @param options Configuration options for the audio
 * @returns Promise that resolves to a blob URL with the audio
 */
export async function generateSpeech(
  text: string, 
  options: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Estimated duration based on text length and rate
      const rate = options.pitch || 1;
      const estimatedDuration = Math.min(Math.max(text.length * 50 / rate, 2000), 15000);
      const audioContext = new AudioContext();
      
      // Create a buffer for our audio
      const sampleRate = audioContext.sampleRate;
      const frameCount = (estimatedDuration / 1000) * sampleRate;
      const audioBuffer = audioContext.createBuffer(2, frameCount, sampleRate);
      
      // Generate speech-like audio with varying frequencies
      const basePitch = (options.pitch || 1) * 140; // Base frequency in Hz
      
      // Fill buffer with synthesized speech-like audio
      for (let channel = 0; channel < 2; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        let phase = 0;
        
        // Create natural rhythm pattern based on words and syllables
        const wordLength = Math.floor(sampleRate * 0.25); // ~250ms per word
        const syllableLength = Math.floor(sampleRate * 0.1); // ~100ms per syllable
        
        // Process text to create a rhythmic pattern resembling speech
        const words = text.split(/\s+/).filter(w => w.length > 0);
        
        // Create variations based on the text
        for (let i = 0; i < frameCount; i++) {
          // Calculate which word and position within the word we're at
          const wordIndex = Math.floor(i / wordLength) % Math.max(words.length, 1);
          const posInWord = i % wordLength;
          const isSyllableStart = posInWord % syllableLength === 0;
          
          // Vary the frequency slightly based on the word to create intonation
          const wordInfluence = words[wordIndex] ? words[wordIndex].length / 10 : 0.5;
          let frequency = basePitch * (0.8 + wordInfluence * 0.4);
          
          // Create natural amplitude envelope - louder at beginning of syllables
          let amplitude = 0.2 + (isSyllableStart ? 0.3 : 0) * Math.exp(-posInWord / (sampleRate * 0.05));
          
          // Small random variations for more natural sound
          frequency += Math.sin(i * 0.0001) * 10;
          amplitude += Math.sin(i * 0.001) * 0.05;
          
          // Add breathing pauses between words
          if (posInWord > wordLength * 0.8) {
            amplitude *= 0.5 * (1 - (posInWord - wordLength * 0.8) / (wordLength * 0.2));
          }
          
          // Generate the waveform
          const tone = Math.sin(phase) * amplitude;
          const noise = (Math.random() * 2 - 1) * 0.05; // Add a little noise for consonants
          
          // Combine tones and apply master volume
          channelData[i] = (tone + noise) * (options.volume || 0.7);
          
          // Update phase
          phase += 2 * Math.PI * frequency / sampleRate;
          if (phase > 2 * Math.PI) {
            phase -= 2 * Math.PI;
          }
        }
      }
      
      // Create an offline context to render this buffer to a MediaStream
      const offlineContext = new OfflineAudioContext(2, frameCount, sampleRate);
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();
      
      // Render the audio
      offlineContext.startRendering().then(renderedBuffer => {
        // Convert the rendered buffer to a media stream for recording
        const audioElement = new Audio();
        const mediaStreamDest = audioContext.createMediaStreamDestination();
        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = renderedBuffer;
        sourceNode.connect(mediaStreamDest);
        
        // Create a recorder to capture the stream
        const mediaRecorder = new MediaRecorder(mediaStreamDest.stream, {
          mimeType: 'audio/webm; codecs=opus'
        });
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm; codecs=opus' });
          console.log(`Generated speech audio blob: size=${blob.size}, type=${blob.type}`);
          const url = URL.createObjectURL(blob);
          console.log(`Generated speech audio URL: ${url}`);
          createdUrls.push(url);
          resolve(url);
          
          // Clean up
          sourceNode.stop();
          audioContext.close();
        };
        
        // Start recording and play the source
        mediaRecorder.start();
        sourceNode.start();
        
        // Stop recording after the buffer duration
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, estimatedDuration + 100);
      }).catch(err => {
        console.error("Error rendering audio:", err);
        reject(err);
      });
    } catch (err) {
      console.error("Error generating speech:", err);
      reject(err);
    }
  });
}

// Clean up all created URLs to prevent memory leaks
export function revokeAllAudioUrls(): void {
  for (const url of createdUrls) {
    try {
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error revoking URL:", err);
    }
  }
  // Clear the array
  createdUrls.length = 0;
} 