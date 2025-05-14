import * as React from "react";

interface AIMessageProps {
  message: string;
}

export function AIMessage({ message }: AIMessageProps) {
  return (
    <div
      className="bg-[rgba(20,20,40,0.4)] backdrop-blur-sm z-10 w-full max-w-[330px] overflow-hidden text-base text-white font-normal text-center py-[20px] px-[30px] rounded-[18px] border border-[rgba(255,255,255,0.08)] shadow-lg"
      role="log"
      aria-live="polite"
    >
      {message.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < message.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
}
