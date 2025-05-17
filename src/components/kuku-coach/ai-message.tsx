import * as React from "react";
import { useEffect, useState, useRef } from "react";

interface AIMessageProps {
  message: string;
  isTyping?: boolean;
  typingSpeed?: number; // Characters per second
}

export function AIMessage({ 
  message, 
  isTyping = false, 
  typingSpeed = 30 
}: AIMessageProps) {
  const [displayedText, setDisplayedText] = useState(isTyping ? "" : message);
  const [isComplete, setIsComplete] = useState(!isTyping);
  const previousMessageRef = useRef("");
  const typingTimerRef = useRef<number | null>(null);
  
  // Handle message changes and typing animation
  useEffect(() => {
    // If not in typing mode, just show the full message
    if (!isTyping) {
      setDisplayedText(message);
      setIsComplete(true);
      return;
    }
    
    // If the message changed, reset and start typing from beginning
    if (previousMessageRef.current !== message) {
      previousMessageRef.current = message;
      setDisplayedText("");
      setIsComplete(false);
      
      // Clear any existing typing animation
      if (typingTimerRef.current !== null) {
        clearTimeout(typingTimerRef.current);
      }
      
      // Only start typing if there's content
      if (message) {
        let currentIndex = 0;
        
        // Function to handle typing one character at a time
        const typeNextCharacter = () => {
          if (currentIndex < message.length) {
            setDisplayedText(message.substring(0, currentIndex + 1));
            currentIndex++;
            
            // Calculate a slightly randomized delay for a more natural effect
            const randomVariation = 0.5 + Math.random();
            const delay = Math.round((1000 / typingSpeed) * randomVariation);
            
            // Schedule the next character
            typingTimerRef.current = window.setTimeout(typeNextCharacter, delay);
          } else {
            // Typing is complete
            setIsComplete(true);
            typingTimerRef.current = null;
          }
        };
        
        // Start the typing animation
        typeNextCharacter();
      }
    }
    
    // Clean up on unmount or when message changes
    return () => {
      if (typingTimerRef.current !== null) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [message, isTyping, typingSpeed]);
  
  // Split the displayed text by newline characters
  const lines = React.useMemo(() => {
    return displayedText.split('\n');
  }, [displayedText]);

  return (
    <div
      className="bg-[rgba(20,20,40,0.4)] backdrop-blur-sm z-10 w-full max-w-[330px] overflow-hidden text-base text-white font-normal text-center py-[20px] px-[30px] rounded-[18px] border border-[rgba(255,255,255,0.08)] shadow-lg"
      role="log"
      aria-live="polite"
    >
      {lines.map((line, i) => (
        // Use a span instead of Fragment to safely handle any injected props
        <span key={i} className="inline">
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
      
      {/* Blinking cursor at the end while typing */}
      {isTyping && !isComplete && (
        <span className="inline-block w-2 h-4 bg-white/80 ml-1 animate-cursor"></span>
      )}
    </div>
  );
}
