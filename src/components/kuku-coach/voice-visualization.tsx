
import * as React from "react";

interface VoiceVisualizationProps {
  isRecording: boolean;
  audioLevel: number;
}

export function VoiceVisualization({ isRecording, audioLevel = 0 }: VoiceVisualizationProps) {
  // References to manage animation
  const animationRef = React.useRef<number>();
  const svgRef = React.useRef<SVGSVGElement>(null);
  
  // Controls for wave animation paths
  const [waveAmplitude, setWaveAmplitude] = React.useState(0);
  
  // Animation effect that runs when recording status or audio level changes
  React.useEffect(() => {
    if (isRecording) {
      // Target amplitude based on audio level (0-1)
      // Scale it up for visual impact (0-40)
      const targetAmplitude = audioLevel * 40;
      
      const animateWaves = () => {
        // Smoothly animate towards the target amplitude
        setWaveAmplitude(prev => {
          if (Math.abs(prev - targetAmplitude) < 0.5) return targetAmplitude;
          return prev + (targetAmplitude - prev) * 0.2; // Smooth easing
        });
        
        animationRef.current = requestAnimationFrame(animateWaves);
      };
      
      animateWaves();
    } else {
      // When not recording, smoothly return to zero
      const fadeOut = () => {
        setWaveAmplitude(prev => {
          const newValue = prev * 0.9;
          if (newValue < 0.1) return 0;
          return newValue;
        });
        
        if (waveAmplitude > 0.1) {
          animationRef.current = requestAnimationFrame(fadeOut);
        }
      };
      
      fadeOut();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, audioLevel]);

  // Generate dynamic wave path based on current amplitude
  const generateWavePath = (baseY: number, amplitude: number, frequency: number) => {
    const width = 200;
    const segments = 20;
    const segmentWidth = width / segments;
    
    let path = `M 20 ${baseY}`;
    
    for (let i = 0; i <= segments; i++) {
      const x = 20 + i * segmentWidth;
      const y = baseY + Math.sin(i * frequency) * amplitude;
      path += ` L ${x} ${y}`;
    }
    
    path += ` L 220 ${baseY}`;
    
    return path;
  };

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
          {/* Dynamic waveforms based on audio level */}
          <g style={{ mixBlendMode: "plus-lighter" }} filter="url(#filter3_di_316_1437)">
            <path
              d={generateWavePath(120, waveAmplitude * 0.8, 0.5)}
              fill="url(#paint7_radial_316_1437)"
              shapeRendering="crispEdges"
            />
          </g>
          <g style={{ mixBlendMode: "plus-lighter" }} filter="url(#filter4_dif_316_1437)">
            <path
              d={generateWavePath(120, waveAmplitude * 0.6, 0.7)}
              fill="url(#paint9_radial_316_1437)"
              shapeRendering="crispEdges"
            />
          </g>
          <g style={{ mixBlendMode: "plus-lighter" }} filter="url(#filter5_di_316_1437)">
            <path
              d={generateWavePath(120, waveAmplitude * 0.9, 0.3)}
              fill="url(#paint11_radial_316_1437)"
              shapeRendering="crispEdges"
            />
          </g>
          <g style={{ mixBlendMode: "plus-lighter" }} filter="url(#filter6_di_316_1437)">
            <path
              d={generateWavePath(121, waveAmplitude * 1.1, 0.4)}
              fill="url(#paint13_radial_316_1437)"
              shapeRendering="crispEdges"
            />
          </g>
          <g style={{ mixBlendMode: "plus-lighter" }} filter="url(#filter7_di_316_1437)">
            <path
              d={generateWavePath(120, waveAmplitude * 0.7, 0.6)}
              fill="url(#paint15_radial_316_1437)"
              shapeRendering="crispEdges"
            />
          </g>
          <g style={{ mixBlendMode: "plus-lighter" }} filter="url(#filter8_di_316_1437)">
            <path
              d={generateWavePath(120, waveAmplitude * 0.5, 0.8)}
              fill="url(#paint17_radial_316_1437)"
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
            <feColorMatrix type="matrix" values="0 0 0 0 0.185021 0 0 0 0 0.156042 0 0 0 0 0.735625 0 0 0 1 0" />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_316_1437" />
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
          
          {/* More filter definitions */}
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
          
          {/* More filters */}
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
          
          {/* Remaining filters */}
          <filter id="filter6_di_316_1437" x="27.0521" y="84" width="213.948" height="82.4978" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
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
          
          <filter id="filter7_di_316_1437" x="11" y="90.3996" width="213" height="67.4977" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
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
            <feColorMatrix type="matrix" values="0 0 0 0 0.416083 0 0 0 0 0.404167 0 0 0 0 1 0 0 0 1 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_316_1437" />
          </filter>
          
          <filter id="filter8_di_316_1437" x="11" y="104.481" width="218" height="29.5871" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="4.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.91225 0 0 0 0 0.6625 0 0 0 0 1 0 0 0 0.8 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_316_1437" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_316_1437" result="shape" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.900833 0 0 0 0 0.854167 0 0 0 0 1 0 0 0 1 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_316_1437" />
          </filter>
          
          {/* Radial gradients */}
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
          
          {/* More radial gradients */}
          <radialGradient id="paint7_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(119.419 123.425) rotate(90) scale(18.0491 102.087)">
            <stop stopColor="#2542DD" stopOpacity="0" />
            <stop offset="1" stopColor="#361D80" />
          </radialGradient>
          
          <radialGradient id="paint8_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(22 126.747) scale(110.704 1488.41)">
            <stop offset="0.297404" stopColor="#D1C1FF" stopOpacity="0.52" />
            <stop offset="1" stopColor="#D1C1FF" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="paint9_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(119 111.874) rotate(90) scale(41.5947 101.647)">
            <stop stopColor="#2542DD" stopOpacity="0" />
            <stop offset="1" stopColor="#11195F" />
          </radialGradient>
          
          <radialGradient id="paint10_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(22 119.529) scale(110.227 3430.09)">
            <stop offset="0.297404" stopColor="#D1C1FF" stopOpacity="0.52" />
            <stop offset="1" stopColor="#D1C1FF" stopOpacity="0" />
          </radialGradient>
          
          {/* More gradients */}
          <radialGradient id="paint11_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(119.419 123.97) rotate(90) scale(8.92811 102.087)">
            <stop stopColor="#2542DD" stopOpacity="0" />
            <stop offset="1" stopColor="#361D80" />
          </radialGradient>
          
          <radialGradient id="paint12_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(22 125.613) scale(110.704 736.253)">
            <stop offset="0.297404" stopColor="#D1C1FF" stopOpacity="0.52" />
            <stop offset="1" stopColor="#D1C1FF" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="paint13_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(119.782 126.459) rotate(90) scale(15.4324 102.467)">
            <stop stopColor="#2542DD" stopOpacity="0" />
            <stop offset="1" stopColor="#361D80" />
          </radialGradient>
          
          <radialGradient id="paint14_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(22 129.299) scale(111.116 1272.62)">
            <stop offset="0.297404" stopColor="#D1C1FF" stopOpacity="0.52" />
            <stop offset="1" stopColor="#D1C1FF" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="paint15_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(120 130.149) rotate(-90) scale(2.42212 104.791)">
            <stop stopColor="#2542DD" stopOpacity="0" />
            <stop offset="1" stopColor="#11195F" />
          </radialGradient>
          
          <radialGradient id="paint16_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 129.704) scale(113.636 199.739)">
            <stop offset="0.297404" stopColor="#D1C1FF" stopOpacity="0.52" />
            <stop offset="1" stopColor="#D1C1FF" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="paint17_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(113.126 119.969) rotate(90) scale(0.881849 97.5876)">
            <stop stopColor="#2542DD" stopOpacity="0" />
            <stop offset="1" stopColor="#361D80" />
          </radialGradient>
          
          <radialGradient id="paint18_radial_316_1437" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 120.131) scale(105.825 72.7214)">
            <stop offset="0.297404" stopColor="#D1C1FF" stopOpacity="0.52" />
            <stop offset="1" stopColor="#D1C1FF" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
