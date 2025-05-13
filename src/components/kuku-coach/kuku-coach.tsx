
import * as React from "react";
import { AIMessage } from "./ai-message";
import { RecordingButton } from "./recording-button";
import { toast } from "@/hooks/use-toast";
import { move } from "./voice-commands";

export function KukuCoach() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [message, setMessage] = React.useState<string>("I'm here to help you with your goals. What would you like to discuss today?");
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

  React.useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript.toLowerCase())
          .join('');
        
        console.log("Transcript:", transcript);
        
        // Check for move commands
        if (transcript.includes('move up')) {
          setPosition(prev => move(prev, 'up'));
          setMessage("Moving up!");
        } else if (transcript.includes('move down')) {
          setPosition(prev => move(prev, 'down'));
          setMessage("Moving down!");
        } else if (transcript.includes('move left')) {
          setPosition(prev => move(prev, 'left'));
          setMessage("Moving left!");
        } else if (transcript.includes('move right')) {
          setPosition(prev => move(prev, 'right'));
          setMessage("Moving right!");
        } else if (transcript.includes('hello') || transcript.includes('hi')) {
          setMessage("Hello! How can I help you today?");
        } else if (transcript.includes('who are you')) {
          setMessage("I'm your Kuku Coach, designed to help with your goals!");
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to use voice commands",
            variant: "destructive"
          });
          setIsRecording(false);
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive"
      });
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setMessage("I'm here to help you with your goals. What would you like to discuss today?");
    } else {
      recognitionRef.current.start();
      setMessage("I'm listening... Say commands like 'move up', 'move down', 'move left', or 'move right'");
    }
    
    setIsRecording(!isRecording);
  };

  const containerStyle = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: 'transform 0.3s ease-out'
  };

  return (
    <main className="bg-[rgba(13,13,13,1)] flex max-w-[480px] w-full flex-col overflow-hidden items-center mx-auto py-[70px]">
      <header className="text-white text-[22px] font-semibold">
        Kuku Coach
      </header>
      
      <section className="flex flex-col items-center w-full">
        <h2 className="text-white text-lg font-normal mt-[43px]">
          Speak to your coach
        </h2>
        
        <div style={containerStyle} className="flex flex-col items-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/a446e2559c0b414e97e3b81441144c5b/2da989af12aaca64ff6247e588a7a161cb9a4618?placeholderIfAbsent=true"
            alt="AI Coach Avatar"
            className="aspect-[0.93] object-contain w-full self-stretch mt-[23px]"
          />
          
          <AIMessage message={message} />
        </div>
        
        <RecordingButton isRecording={isRecording} onClick={toggleRecording} />
        
        {isRecording && (
          <p className="text-white text-xs mt-2 animate-pulse">
            Listening...
          </p>
        )}
      </section>
    </main>
  );
}
