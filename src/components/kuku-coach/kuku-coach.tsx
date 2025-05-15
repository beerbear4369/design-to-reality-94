import * as React from "react";
import { AIMessage } from "./ai-message";
import { RecordingButton } from "./recording-button";
import { VoiceVisualization } from "./voice-visualization";
import { useAudioLevel } from "@/hooks/use-audio-level";

export function KukuCoach() {
  const [isRecording, setIsRecording] = React.useState(false);
  const { audioLevel, frequencyData, error } = useAudioLevel({ isRecording });

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <main className="bg-black flex max-w-[400px] w-full flex-col overflow-hidden items-center mx-auto py-[40px] min-h-screen">
      <header className="text-white text-[28px] font-semibold tracking-wide">
        Kuku Coach
      </header>
      
      <section className="flex flex-col items-center justify-between w-full flex-1">
        <h2 className="text-white text-lg font-normal mt-[32px] opacity-90">
          Speak to your coach
        </h2>
        
        {/* Voice visualization - enhanced sizing and positioning */}
        <div className="w-full flex justify-center mt-[30px]">
          <div className="w-[300px] h-[300px] relative">
            <VoiceVisualization 
              isRecording={isRecording} 
              audioLevel={audioLevel}
              frequencyData={frequencyData}
            />
          </div>
        </div>
        
        {/* Fixed height container for message with improved spacing */}
        <div className="min-h-[100px] flex items-center justify-center w-full px-6 mt-[20px]">
        <AIMessage 
          message={
            error ? 
              error : 
              isRecording ? 
                "I'm listening..." : 
                  "I'm here to help you with your goals.\nWhat would you like to discuss today?"
          } 
        />
        </div>
        
        {/* Recording button with better positioning */}
        <div className="mb-[50px] mt-[20px]">
        <RecordingButton isRecording={isRecording} onClick={toggleRecording} />
        </div>
      </section>
    </main>
  );
}
