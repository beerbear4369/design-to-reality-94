
/**
 * Generates a wave path with specific characteristics
 */
export const generateWavePath = (
  baseY: number, 
  amplitude: number, 
  frequency: number, 
  phaseOffset: number = 0,
  width: number = 200,
  segments: number = 20
) => {
  const segmentWidth = width / segments;
  
  let path = `M 20 ${baseY}`;
  
  for (let i = 0; i <= segments; i++) {
    const x = 20 + i * segmentWidth;
    const y = baseY + Math.sin(i * frequency + phaseOffset) * amplitude;
    path += ` L ${x} ${y}`;
  }
  
  path += ` L 220 ${baseY}`;
  
  return path;
};

/**
 * Generate a more complex multi-sine wave path
 */
export const generateComplexWavePath = (
  baseY: number,
  primaryAmplitude: number,
  secondaryAmplitude: number = primaryAmplitude * 0.3,
  primaryFrequency: number = 0.5,
  secondaryFrequency: number = 1.5,
  phaseOffset: number = 0,
  width: number = 200,
  segments: number = 30
) => {
  const segmentWidth = width / segments;
  
  let path = `M 20 ${baseY}`;
  
  for (let i = 0; i <= segments; i++) {
    const x = 20 + i * segmentWidth;
    
    // Combine two sine waves with different frequencies for more complex motion
    const primaryWave = Math.sin(i * primaryFrequency + phaseOffset) * primaryAmplitude;
    const secondaryWave = Math.sin(i * secondaryFrequency + phaseOffset * 2) * secondaryAmplitude;
    
    const y = baseY + primaryWave + secondaryWave;
    path += ` L ${x} ${y}`;
  }
  
  path += ` L 220 ${baseY}`;
  
  return path;
};

/**
 * Generate a Siri-style wave that contains multiple harmonics
 */
export const generateSiriWavePath = (
  baseY: number,
  amplitude: number,
  width: number = 200,
  segments: number = 40,
  timeOffset: number = 0
) => {
  const segmentWidth = width / segments;
  const frequencies = [1, 2, 3, 4]; // Multiple harmonics for rich wave
  const amplitudeFactors = [1, 0.6, 0.4, 0.2]; // Decreasing amplitude for each harmonic
  
  let path = `M 20 ${baseY}`;
  
  for (let i = 0; i <= segments; i++) {
    const x = 20 + i * segmentWidth;
    let y = baseY;
    
    // Sum multiple sine waves with different frequencies (harmonics)
    for (let j = 0; j < frequencies.length; j++) {
      const freq = frequencies[j] * 0.15; // Scale down frequency for smoother waves
      const phase = timeOffset * frequencies[j] * 0.2; // Different phase velocity for each harmonic
      const amp = amplitude * amplitudeFactors[j]; // Scale amplitude by the factor
      y += Math.sin(i * freq + phase) * amp;
    }
    
    path += ` L ${x} ${y}`;
  }
  
  path += ` L 220 ${baseY}`;
  
  return path;
};

/**
 * Generate a curved cubic-bezier wave for smoother transitions
 */
export const generateSmoothWavePath = (
  baseY: number,
  amplitude: number,
  frequency: number = 0.3,
  phaseOffset: number = 0,
  width: number = 200,
  segments: number = 10 // Fewer segments because we're using curves
) => {
  const segmentWidth = width / segments;
  
  // Starting point
  let path = `M 20 ${baseY}`;
  let prevX = 20;
  let prevY = baseY;
  
  for (let i = 1; i <= segments; i++) {
    const x = 20 + i * segmentWidth;
    const y = baseY + Math.sin(i * frequency + phaseOffset) * amplitude;
    
    // Calculate control points for smooth curve
    const cpX1 = prevX + segmentWidth / 3;
    const cpX2 = x - segmentWidth / 3;
    const midY = (prevY + y) / 2;
    
    // Use cubic bezier curve for smoother transition
    path += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
    
    prevX = x;
    prevY = y;
  }
  
  path += ` L 220 ${baseY}`;
  
  return path;
};
