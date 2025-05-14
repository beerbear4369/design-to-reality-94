import * as React from "react";
import { Mic, MicOff } from "lucide-react";

interface RecordingButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export function RecordingButton({ isRecording, onClick }: RecordingButtonProps) {
  return (
    <button
      className={`flex w-16 h-16 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 ${
        isRecording 
          ? "bg-[#e91e63] shadow-lg shadow-[#e91e63]/30" 
          : "bg-[#3f51b5] hover:bg-[#3949ab] shadow-lg shadow-[#3f51b5]/20"
      }`}
      onClick={onClick}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
      aria-pressed={isRecording}
    >
      {isRecording ? (
        <MicOff className="w-7 h-7 text-white" />
      ) : (
        <Mic className="w-7 h-7 text-white" />
      )}
    </button>
  );
}
