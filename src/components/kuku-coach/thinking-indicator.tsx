import * as React from "react";

interface ThinkingIndicatorProps {
  isThinking: boolean;
}

export function ThinkingIndicator({ isThinking }: ThinkingIndicatorProps) {
  if (!isThinking) return null;

  return (
    <div className="flex flex-col items-center justify-center p-4 mb-4">
      <div className="text-white/80 mb-2 text-center">
        Kuku is thinking...
      </div>
      
      {/* Animated dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-[#3f51b5] rounded-full animate-thinking-bounce"
            style={{
              animationDelay: `${i * 0.16}s`
            }}
          />
        ))}
      </div>
    </div>
  );
} 