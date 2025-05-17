/**
 * Audio generator utility
 * Creates simple WAV files for testing audio playback
 */

// Store created URLs for cleanup
const createdUrls: string[] = [];

// Generate a simple beep tone as a WAV file
export function generateBeepWav(duration = 1, frequency = 440, volume = 0.5): string {
  // Audio parameters
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * duration);
  const amplitude = 32767 * volume; // 16-bit audio max amplitude * volume
  
  // Create the WAV header
  const header = createWavHeader(numSamples, sampleRate);
  
  // Create the audio data (sine wave)
  const data = new Int16Array(numSamples);
  
  for (let i = 0; i < numSamples; i++) {
    // Simple sine wave at the specified frequency
    data[i] = Math.round(amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate));
  }
  
  // Combine header and data into a Blob
  const blob = new Blob([header, data], { type: 'audio/wav' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  createdUrls.push(url);
  return url;
}

// Generate a sequence of tones as a WAV file
export function generateSequence(tones: Array<{freq: number, duration: number}>, volume = 0.5): string {
  // Audio parameters
  const sampleRate = 44100;
  const totalSamples = Math.floor(sampleRate * tones.reduce((sum, tone) => sum + tone.duration, 0));
  const amplitude = 32767 * volume; // 16-bit audio max amplitude * volume
  
  // Create the WAV header
  const header = createWavHeader(totalSamples, sampleRate);
  
  // Create the audio data for each tone
  const data = new Int16Array(totalSamples);
  let sampleIndex = 0;
  
  for (const tone of tones) {
    const toneSamples = Math.floor(sampleRate * tone.duration);
    
    for (let i = 0; i < toneSamples; i++) {
      if (sampleIndex < totalSamples) {
        // Simple sine wave at the specified frequency
        data[sampleIndex] = Math.round(amplitude * Math.sin(2 * Math.PI * tone.freq * i / sampleRate));
        sampleIndex++;
      }
    }
  }
  
  // Combine header and data into a Blob
  const blob = new Blob([header, data], { type: 'audio/wav' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  createdUrls.push(url);
  return url;
}

// Create the WAV header with the correct format
function createWavHeader(numSamples: number, sampleRate: number): ArrayBuffer {
  const numChannels = 1; // Mono
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44; // WAV header size
  
  const header = new ArrayBuffer(headerSize);
  const view = new DataView(header);
  
  // "RIFF" chunk descriptor
  setString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // Chunk size
  setString(view, 8, 'WAVE');
  
  // "fmt " sub-chunk
  setString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample
  
  // "data" sub-chunk
  setString(view, 36, 'data');
  view.setUint32(40, dataSize, true); // Subchunk2Size
  
  return header;
}

// Helper to set a string in a DataView
function setString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
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