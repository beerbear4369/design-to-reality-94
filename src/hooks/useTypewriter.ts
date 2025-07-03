import { useState, useEffect, useCallback } from 'react';

interface TypewriterOptions {
  text: string;
  speed?: number; // milliseconds per character
  delay?: number; // initial delay before starting
  onComplete?: () => void;
}

interface TypewriterReturn {
  displayedText: string;
  isComplete: boolean;
  isTyping: boolean;
  skip: () => void;
}

export function useTypewriter({
  text,
  speed = 50,
  delay = 0,
  onComplete
}: TypewriterOptions): TypewriterReturn {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const skip = useCallback(() => {
    setDisplayedText(text);
    setCurrentIndex(text.length);
    setIsComplete(true);
    setIsTyping(false);
    onComplete?.();
  }, [text, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
    setIsTyping(false);
    setHasStarted(false);
  }, [text]);

  useEffect(() => {
    if (!text || hasStarted) return;

    // If user prefers reduced motion, show text immediately
    if (prefersReducedMotion) {
      skip();
      return;
    }

    // Initial delay before starting
    const startTimeout = setTimeout(() => {
      setHasStarted(true);
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, delay, hasStarted, prefersReducedMotion, skip]);

  useEffect(() => {
    if (!hasStarted || isComplete || !isTyping) return;

    if (currentIndex >= text.length) {
      setIsComplete(true);
      setIsTyping(false);
      onComplete?.();
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(text.slice(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, hasStarted, isComplete, isTyping, onComplete]);

  return {
    displayedText,
    isComplete,
    isTyping,
    skip
  };
}

// Hook for sequential typewriter effects
interface SequentialTypewriterOptions {
  texts: string[];
  speed?: number;
  delayBetween?: number;
  initialDelay?: number;
  onStepComplete?: (index: number) => void;
  onAllComplete?: () => void;
}

interface SequentialTypewriterReturn {
  displayedTexts: string[];
  currentStep: number;
  isComplete: boolean;
  skip: () => void;
}

export function useSequentialTypewriter({
  texts,
  speed = 50,
  delayBetween = 500,
  initialDelay = 0,
  onStepComplete,
  onAllComplete
}: SequentialTypewriterOptions): SequentialTypewriterReturn {
  const [currentStep, setCurrentStep] = useState(-1);
  const [displayedTexts, setDisplayedTexts] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const currentText = currentStep >= 0 && currentStep < texts.length ? texts[currentStep] : '';

  // Reset everything when texts array changes or becomes empty
  const textsKey = texts.join('|');
  useEffect(() => {
    if (texts.length === 0) {
      setCurrentStep(-1);
      setDisplayedTexts([]);
      setIsComplete(false);
      setIsActive(false);
      return;
    }

    // Only reset if texts actually changed (not just reference)
    setCurrentStep(-1);
    setDisplayedTexts(new Array(texts.length).fill(''));
    setIsComplete(false);
    setIsActive(true);
  }, [texts.length, textsKey]); // Use textsKey to detect actual content changes

  const { displayedText, isComplete: stepComplete } = useTypewriter({
    text: currentText,
    speed,
    delay: currentStep === 0 ? initialDelay : 0, // Remove delayBetween from individual typewriter
    onComplete: () => {
      onStepComplete?.(currentStep);
    }
  });

  // Update displayed texts array
  useEffect(() => {
    if (currentStep >= 0 && currentStep < texts.length) {
      setDisplayedTexts(prev => {
        const newTexts = [...prev];
        newTexts[currentStep] = displayedText;
        return newTexts;
      });
    }
  }, [displayedText, currentStep, texts.length]);

  // Move to next step when current step completes
  useEffect(() => {
    if (!isActive || !stepComplete) return;

    if (currentStep < texts.length - 1) {
      const timeoutId = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, delayBetween);
      
      return () => clearTimeout(timeoutId);
    } else if (currentStep === texts.length - 1) {
      setIsComplete(true);
      onAllComplete?.();
    }
  }, [stepComplete, currentStep, texts.length, delayBetween, onAllComplete, isActive]);

  // Start the sequence
  useEffect(() => {
    if (texts.length > 0 && currentStep === -1 && isActive) {
      const timeoutId = setTimeout(() => {
        setCurrentStep(0);
      }, initialDelay);
      
      return () => clearTimeout(timeoutId);
    }
  }, [texts.length, currentStep, initialDelay, isActive]);

  const skip = useCallback(() => {
    if (texts.length === 0) return;
    
    setDisplayedTexts([...texts]);
    setCurrentStep(texts.length - 1);
    setIsComplete(true);
    onAllComplete?.();
  }, [texts, onAllComplete]);

  return {
    displayedTexts,
    currentStep,
    isComplete,
    skip
  };
}

// Hook for word-by-word typewriter effects
interface WordTypewriterOptions {
  text: string;
  speed?: number; // milliseconds per word
  delay?: number; // initial delay before starting
  onComplete?: () => void;
}

interface WordTypewriterReturn {
  displayedText: string;
  isComplete: boolean;
  isTyping: boolean;
  skip: () => void;
}

export function useWordTypewriter({
  text,
  speed = 300,
  delay = 0,
  onComplete
}: WordTypewriterOptions): WordTypewriterReturn {
  const [displayedText, setDisplayedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const words = text.split(' ').filter(word => word.length > 0);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const skip = useCallback(() => {
    setDisplayedText(text);
    setCurrentWordIndex(words.length);
    setIsComplete(true);
    setIsTyping(false);
    onComplete?.();
  }, [text, words.length, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentWordIndex(0);
    setIsComplete(false);
    setIsTyping(false);
    setHasStarted(false);
  }, [text]);

  useEffect(() => {
    if (!text || hasStarted || words.length === 0) return;

    // If user prefers reduced motion, show text immediately
    if (prefersReducedMotion) {
      skip();
      return;
    }

    // Initial delay before starting
    const startTimeout = setTimeout(() => {
      setHasStarted(true);
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, delay, hasStarted, prefersReducedMotion, skip, words.length]);

  useEffect(() => {
    if (!hasStarted || isComplete || !isTyping || words.length === 0) return;

    if (currentWordIndex >= words.length) {
      setIsComplete(true);
      setIsTyping(false);
      onComplete?.();
      return;
    }

    const timeout = setTimeout(() => {
      const wordsToShow = words.slice(0, currentWordIndex + 1).join(' ');
      setDisplayedText(wordsToShow);
      setCurrentWordIndex(currentWordIndex + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentWordIndex, words, speed, hasStarted, isComplete, isTyping, onComplete]);

  return {
    displayedText,
    isComplete,
    isTyping,
    skip
  };
}

// Hook for sequential word-by-word typewriter effects
interface SequentialWordTypewriterOptions {
  texts: string[];
  speed?: number;
  delayBetween?: number;
  initialDelay?: number;
  onStepComplete?: (index: number) => void;
  onAllComplete?: () => void;
}

interface SequentialWordTypewriterReturn {
  displayedTexts: string[];
  currentStep: number;
  isComplete: boolean;
  skip: () => void;
}

export function useSequentialWordTypewriter({
  texts,
  speed = 300,
  delayBetween = 500,
  initialDelay = 0,
  onStepComplete,
  onAllComplete
}: SequentialWordTypewriterOptions): SequentialWordTypewriterReturn {
  const [currentStep, setCurrentStep] = useState(-1);
  const [displayedTexts, setDisplayedTexts] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const currentText = currentStep >= 0 && currentStep < texts.length ? texts[currentStep] : '';

  // Reset everything when texts array changes or becomes empty
  const textsKey = texts.join('|');
  useEffect(() => {
    if (texts.length === 0) {
      setCurrentStep(-1);
      setDisplayedTexts([]);
      setIsComplete(false);
      setIsActive(false);
      return;
    }

    // Only reset if texts actually changed (not just reference)
    setCurrentStep(-1);
    setDisplayedTexts(new Array(texts.length).fill(''));
    setIsComplete(false);
    setIsActive(true);
  }, [texts.length, textsKey]);

  const { displayedText, isComplete: stepComplete } = useWordTypewriter({
    text: currentText,
    speed,
    delay: currentStep === 0 ? initialDelay : 0,
    onComplete: () => {
      onStepComplete?.(currentStep);
    }
  });

  // Update displayed texts array
  useEffect(() => {
    if (currentStep >= 0 && currentStep < texts.length) {
      setDisplayedTexts(prev => {
        const newTexts = [...prev];
        newTexts[currentStep] = displayedText;
        return newTexts;
      });
    }
  }, [displayedText, currentStep, texts.length]);

  // Move to next step when current step completes
  useEffect(() => {
    if (!isActive || !stepComplete) return;

    if (currentStep < texts.length - 1) {
      const timeoutId = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, delayBetween);
      
      return () => clearTimeout(timeoutId);
    } else if (currentStep === texts.length - 1) {
      setIsComplete(true);
      onAllComplete?.();
    }
  }, [stepComplete, currentStep, texts.length, delayBetween, onAllComplete, isActive]);

  // Start the sequence
  useEffect(() => {
    if (texts.length > 0 && currentStep === -1 && isActive) {
      const timeoutId = setTimeout(() => {
        setCurrentStep(0);
      }, initialDelay);
      
      return () => clearTimeout(timeoutId);
    }
  }, [texts.length, currentStep, initialDelay, isActive]);

  const skip = useCallback(() => {
    if (texts.length === 0) return;
    
    setDisplayedTexts([...texts]);
    setCurrentStep(texts.length - 1);
    setIsComplete(true);
    onAllComplete?.();
  }, [texts, onAllComplete]);

  return {
    displayedTexts,
    currentStep,
    isComplete,
    skip
  };
}