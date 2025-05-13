
import * as React from "react";
import { Mic, MicOff } from "lucide-react";

interface RecordingButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export function RecordingButton({ isRecording, onClick }: RecordingButtonProps) {
  return (
    <button
      className={`flex w-20 flex-col overflow-hidden items-center justify-center h-20 mt-4 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors ${
        isRecording 
          ? "bg-[rgba(233,30,99,1)] shadow-lg shadow-[rgba(233,30,99,0.4)]" 
          : "bg-[rgba(50,44,164,1)] hover:bg-[rgba(60,54,184,1)]"
      }`}
      onClick={onClick}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
      aria-pressed={isRecording}
    >
      {isRecording ? (
        <MicOff className="w-8 h-8 text-white" />
      ) : (
        <Mic className="w-8 h-8 text-white" />
      )}
    </button>
  );
}
