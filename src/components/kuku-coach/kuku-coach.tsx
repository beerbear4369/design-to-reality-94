
import * as React from "react";
import { AIMessage } from "./ai-message";
import { RecordingButton } from "./recording-button";
import { VoiceVisualization } from "./voice-visualization";
import { useAudioLevel } from "@/hooks/use-audio-level";

export function KukuCoach() {
  const [isRecording, setIsRecording] = React.useState(false);
  const { audioLevel, error } = useAudioLevel({ isRecording });

  const toggleRecording = () => {
    setIsRecording(!isRecording);
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
        
        {/* Voice visualization replaces the avatar image when recording */}
        <div className="mt-[23px] w-full">
          {isRecording ? (
            <VoiceVisualization isRecording={isRecording} audioLevel={audioLevel} />
          ) : (
            <img
              src="https://cdn.builder.io/api/v1/image/assets/a446e2559c0b414e97e3b81441144c5b/2da989af12aaca64ff6247e588a7a161cb9a4618?placeholderIfAbsent=true"
              alt="AI Coach Avatar"
              className="aspect-[0.93] object-contain w-full self-stretch"
            />
          )}
        </div>
        
        <AIMessage 
          message={
            error ? 
              error : 
              isRecording ? 
                "I'm listening..." : 
                "I'm here to help you with your goals. What would you like to discuss today?"
          } 
        />
        
        <RecordingButton isRecording={isRecording} onClick={toggleRecording} />
      </section>
    </main>
  );
}
