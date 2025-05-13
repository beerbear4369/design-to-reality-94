
import * as React from "react";

interface RecordingButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export function RecordingButton({ isRecording, onClick }: RecordingButtonProps) {
  return (
    <button
      className="bg-[rgba(50,44,164,1)] flex w-20 flex-col overflow-hidden items-center justify-center h-20 mt-2 px-4 rounded-[40px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-transform hover:scale-105"
      onClick={onClick}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
      aria-pressed={isRecording}
    >
      <div
        className={`${
          isRecording
            ? "bg-white w-full h-[30px] rounded-[5px]"
            : "bg-red-500 w-[30px] h-[30px] rounded-full"
        }`}
      />
    </button>
  );
}
