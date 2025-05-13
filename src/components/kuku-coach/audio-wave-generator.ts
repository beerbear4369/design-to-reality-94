
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
