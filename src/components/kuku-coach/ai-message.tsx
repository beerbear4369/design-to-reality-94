import * as React from "react";

interface AIMessageProps {
  message: string;
}

export function AIMessage({ message }: AIMessageProps) {
  // Split the message by newline characters
  const lines = React.useMemo(() => {
    return message.split('\n');
  }, [message]);

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
    </div>
  );
}
