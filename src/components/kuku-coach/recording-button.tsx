import * as React from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface RecordingButtonProps {
  isRecording: boolean;
  onClick: () => void;
  isProcessing?: boolean;
  error?: string | null;
  recordingDuration?: number; 
}

export function RecordingButton({ 
  isRecording, 
  onClick, 
  isProcessing = false,
  error = null,
  recordingDuration = 0
}: RecordingButtonProps) {
  // Format recording duration (MM:SS)
  const formattedDuration = React.useMemo(() => {
    if (!recordingDuration) return "";
    const minutes = Math.floor(recordingDuration / 60);
    const seconds = Math.floor(recordingDuration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [recordingDuration]);

  return (
    <div className="flex flex-col items-center">
      {/* Recording duration display */}
      {isRecording && recordingDuration > 0 && (
        <div className="text-white/90 text-sm mb-2 font-mono">{formattedDuration}</div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="text-red-400 text-xs mb-2 max-w-[200px] text-center">{error}</div>
      )}
      
      {/* Recording button */}
      <button
        className={`
          flex w-16 h-16 items-center justify-center rounded-full 
          focus:outline-none focus:ring-2 focus:ring-white/50 
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isRecording 
            ? "bg-[#e91e63] shadow-lg shadow-[#e91e63]/30 hover:bg-[#d81b60]" 
            : "bg-[#3f51b5] hover:bg-[#3949ab] shadow-lg shadow-[#3f51b5]/20"
          }
          ${error ? "border-2 border-red-400" : ""}
        `}
        onClick={onClick}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        aria-pressed={isRecording}
        disabled={isProcessing}
        title={isRecording ? "Stop recording" : "Start recording"}
      >
        {isProcessing ? (
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-7 h-7 text-white" />
        ) : (
          <Mic className="w-7 h-7 text-white" />
        )}
      </button>
    </div>
  );
}
