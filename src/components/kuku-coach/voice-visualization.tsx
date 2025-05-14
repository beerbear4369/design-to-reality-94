
import * as React from "react";
import { 
  generateSiriWavePath, 
  generateSmoothWavePath, 
  generateComplexWavePath,
  generateDynamicWavePath
} from "./audio-wave-generator";

interface VoiceVisualizationProps {
  isRecording: boolean;
  audioLevel: number;
  frequencyData?: {
    low: number;
    mid: number;
    high: number;
    overall: number;
  };
}

export function VoiceVisualization({ 
  isRecording, 
  audioLevel = 0,
  frequencyData = { low: 0, mid: 0, high: 0, overall: 0 } 
}: VoiceVisualizationProps) {
  // References to manage animation
  const animationRef = React.useRef<number>();
  const svgRef = React.useRef<SVGSVGElement>(null);
  
  // Animation state
  const [waveAmplitude, setWaveAmplitude] = React.useState(0);
  const [timeOffset, setTimeOffset] = React.useState(0);
  const [wavePhases, setWavePhases] = React.useState({
    wave1: 0,
    wave2: Math.PI / 3,
    wave3: (2 * Math.PI) / 3,
  });
  
  // Animation effect that runs when recording status or audio level changes
  React.useEffect(() => {
    if (isRecording) {
      // Scale audio level non-linearly for better visual response
      const scaledAudioLevel = audioLevel < 0.1 
        ? audioLevel * 3 
        : 0.3 + (audioLevel * 0.5);
      
      // Target amplitude based on scaled audio level (0-40)
      const targetAmplitude = Math.min(scaledAudioLevel * 40, 40);
      
      const animateWaves = () => {
        // Slower time offset for calmer wave movement
        setTimeOffset(prev => prev + 0.02);
        
        // Create dynamic phase update speeds based on frequency content
        const lowImpact = Math.pow(frequencyData.low, 0.5) * 0.005 + 0.005;
        const midImpact = Math.pow(frequencyData.mid, 0.5) * 0.01 + 0.007;
        const highImpact = Math.pow(frequencyData.high, 0.5) * 0.02 + 0.01;
        
        // Update wave phases - now only 3 waves with more distinct behaviors
        setWavePhases(prev => ({
          wave1: prev.wave1 + lowImpact * 1.5,         // Primarily responds to bass/low frequencies
          wave2: prev.wave2 + midImpact * 1.2,         // Primarily responds to mid-range frequencies
          wave3: prev.wave3 + highImpact * 0.9,        // Primarily responds to high frequencies
        }));
        
        // Smoothly animate towards the target amplitude
        setWaveAmplitude(prev => {
          if (Math.abs(prev - targetAmplitude) < 0.5) return targetAmplitude;
          const rate = prev < targetAmplitude ? 0.15 : 0.05;
          return prev + (targetAmplitude - prev) * rate;
        });
        
        // Slow down animation frame rate
        animationRef.current = setTimeout(() => {
          requestAnimationFrame(animateWaves);
        }, 33) as unknown as number;
      };
      
      animateWaves();
    } else {
      // When not recording, smoothly fade out
      const fadeOut = () => {
        setTimeOffset(prev => prev + 0.01);
        
        // Slower phase changes during fade out - with just 3 waves
        setWavePhases(prev => ({
          wave1: prev.wave1 + 0.005,
          wave2: prev.wave2 + 0.007,
          wave3: prev.wave3 + 0.009,
        }));
        
        // Slower fade out rate
        setWaveAmplitude(prev => {
          const newValue = prev * 0.97;
          if (newValue < 0.1) return 0;
          return newValue;
        });
        
        if (waveAmplitude > 0.1) {
          animationRef.current = setTimeout(() => {
            requestAnimationFrame(fadeOut);
          }, 33) as unknown as number;
        }
      };
      
      fadeOut();
    }
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current as unknown as number);
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, audioLevel, frequencyData]);

  // Calculate frequency-based amplitude modifiers
  const lowFreqAmplitude = frequencyData.low * 1.0;
  const midFreqAmplitude = frequencyData.mid * 0.8;
  const highFreqAmplitude = frequencyData.high * 0.6;

  // Calculate dynamic frequency multipliers
  const lowFreqMult = 0.85 + frequencyData.low * 0.3;
  const midFreqMult = 0.9 + frequencyData.mid * 0.4;
  const highFreqMult = 1.0 + frequencyData.high * 0.7;

  return (
    <div className="relative w-full flex justify-center items-center mt-4">
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        width="240"
        height="240"
        viewBox="0 0 240 240"
        fill="none"
        className="w-full max-w-[240px] h-auto"
      >
        <g filter="url(#filter0_f_316_1437)">
          <circle cx="120" cy="120" r="100" fill="url(#paint0_radial_316_1437)" fillOpacity="0.4" />
        </g>
        <g filter="url(#filter1_f_316_1437)">
          <circle cx="120" cy="120" r="100" fill="url(#paint1_radial_316_1437)" fillOpacity="0.8" />
        </g>
        <g filter="url(#filter2_iii_316_1437)">
          <circle cx="120" cy="120" r="100" fill="#080722" />
          <circle cx="120" cy="120" r="100" fill="url(#paint2_radial_316_1437)" fillOpacity="0.9" />
          <circle cx="120" cy="120" r="100" fill="url(#paint3_radial_316_1437)" fillOpacity="0.85" />
          <circle cx="120" cy="120" r="100" fill="url(#paint4_radial_316_1437)" fillOpacity="0.8" />
          <circle cx="120" cy="120" r="100" fill="url(#paint5_radial_316_1437)" fillOpacity="0.45" />
        </g>
        <mask id="mask0_316_1437" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="20" y="20" width="200" height="200">
          <circle cx="120" cy="120" r="100" fill="url(#paint6_radial_316_1437)" />
        </mask>
        <g mask="url(#mask0_316_1437)">
          {/* Wave 1: Low frequency responsive wave (purple) */}
          <g style={{ mixBlendMode: "plus-lighter" }} filter="url(#filter5_di_316_1437)">
            <path
              d={generateSmoothWavePath(
                120, 
                waveAmplitude * (0.8 + lowFreqAmplitude * 0.4), 
                0.25 * lowFreqMult,
                timeOffset + wavePhases.wave1
              )}
              fill="url(#paint11_radial_316_1437)"
              shapeRendering="crispEdges"
            />
          </g>
          
          {/* Wave 2: Mid-frequency responsive wave (blue) */}
          <g style={{ mixBlendMode: "plus-lighter" }} filter="url(#filter4_dif_316_1437)">
            <path
              d={generateComplexWavePath(
                120, 
                waveAmplitude * (0.7 + midFreqAmplitude * 0.3),
                waveAmplitude * (0.2 + midFreqAmplitude * 0.2),
                0.6 * midFreqMult,
                1.0 * midFreqMult,
                timeOffset + wavePhases.wave2
              )}
              fill="url(#paint9_radial_316_1437)"
              shapeRendering="crispEdges"
            />
          </g>
          
          {/* Wave 3: High-frequency responsive wave (cyan) */}
          <g style={{ mixBlendMode: "plus-lighter" }} filter="url(#filter3_di_316_1437)">
            <path
              d={generateDynamicWavePath(
                120, 
                waveAmplitude * (0.6 + highFreqAmplitude * 0.4),
                frequencyData.low,
                frequencyData.mid,
                frequencyData.high,
                timeOffset + wavePhases.wave3
              )}
              fill="url(#paint7_radial_316_1437)"
              shapeRendering="crispEdges"
            />
          </g>
        </g>
        
        {/* Definitions for filters and gradients */}
        <defs>
          <filter id="filter0_f_316_1437" x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="10" result="effect1_foregroundBlur_316_1437" />
          </filter>
          <filter id="filter1_f_316_1437" x="15" y="15" width="210" height="210" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="2.5" result="effect1_foregroundBlur_316_1437" />
          </filter>
          <filter id="filter2_iii_316_1437" x="20" y="20" width="200" height="200" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feGaussianBlur stdDeviation="20" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.185021 0 0 0 0 0.156042 0 0 0 0 0.735625 0 0 0 1 0" result="effect1_innerShadow_316_1437" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_316_1437" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feGaussianBlur stdDeviation="15" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.2075 0 0 0 0 0.175 0 0 0 0 0.825 0 0 0 1 0" />
            <feBlend mode="normal" in2="effect1_innerShadow_316_1437" result="effect2_innerShadow_316_1437" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feGaussianBlur stdDeviation="6" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.791969 0 0 0 0 0.783437 0 0 0 0 0.954063 0 0 0 1 0" />
            <feBlend mode="normal" in2="effect2_innerShadow_316_1437" result="effect3_innerShadow_316_1437" />
          </filter>
          
          <filter id="filter3_di_316_1437" x="13" y="94.9975" width="212.839" height="49.9287" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="4.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.426944 0 0 0 0 0.966667 0 0 0 0 0.966667 0 0 0 0.8 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_316_1437" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_316_1437" result="shape" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.900833 0 0 0 0 0.854167 0 0 0 0 1 0 0 0 1 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_316_1437" />
          </filter>
          
          <filter id="filter4_dif_316_1437" x="34.9053" y="73.912" width="190.095" height="86.6914" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="4.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.426944 0 0 0 0 0.578067 0 0 0 0 0.966667 0 0 0 0.8 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_316_1437" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_316_1437" result="shape" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.416083 0 0 0 0 0.404167 0 0 0 0 1 0 0 0 1 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_316_1437" />
            <feGaussianBlur stdDeviation="0.25" result="effect3_foregroundBlur_316_1437" />
          </filter>
          
          <filter id="filter5_di_316_1437" x="13" y="104.383" width="212.839" height="37.7863" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="4.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.664422 0 0 0 0 0.426944 0 0 0 0 0.966667 0 0 0 0.8 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_316_1437" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_316_1437" result="shape" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.900833 0 0 0 0 0.854167 0 0 0 0 1 0 0 0 1 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_316_1437" />
          </filter>
          
          <radialGradient id="paint0_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(120 120) rotate(90) scale(100)">
            <stop stopColor="#312CA3" />
            <stop offset="0.3137" stopColor="#360E69" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="paint1_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(120 120) rotate(90) scale(100)">
            <stop stopColor="#312CA3" />
            <stop offset="0.3137" stopColor="#360E69" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="paint2_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(78 33) rotate(63.4457) scale(97.2598 115.376)">
            <stop stopColor="#8F8AE6" stopOpacity="0.63" />
            <stop offset="1" stopColor="#2C25AD" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="paint3_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(214.675 87.752) rotate(151.458) scale(88.4213)">
            <stop stopColor="#3E36D4" />
            <stop offset="1" stopColor="#3029C0" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="paint4_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(153.137 214.675) rotate(-108.939) scale(63.8096)">
            <stop stopColor="#5B54DB" />
            <stop offset="1" stopColor="#5B55DB" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="paint5_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(97 120) rotate(-19.7672) scale(68.0074 101.344)">
            <stop stopColor="#2D26B2" />
            <stop offset="1" stopColor="#453DD6" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="paint6_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(120 120) rotate(90) scale(100)">
            <stop offset="0.351881" stopColor="#D9D9D9" />
            <stop offset="1" stopColor="#D9D9D9" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="paint7_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(119.419 123.425) rotate(90) scale(18.0491 102.087)">
            <stop stopColor="#2542DD" stopOpacity="0" />
            <stop offset="1" stopColor="#361D80" />
          </radialGradient>
          
          <radialGradient id="paint9_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(119 111.874) rotate(90) scale(41.5947 101.647)">
            <stop stopColor="#2542DD" stopOpacity="0" />
            <stop offset="1" stopColor="#11195F" />
          </radialGradient>
          
          <radialGradient id="paint11_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(119.419 123.97) rotate(90) scale(8.92811 102.087)">
            <stop stopColor="#2542DD" stopOpacity="0" />
            <stop offset="1" stopColor="#361D80" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
