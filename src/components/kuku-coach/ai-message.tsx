import * as React from "react";

interface AIMessageProps {
  message: string;
}

export function AIMessage({ message }: AIMessageProps) {
  return (
    <div
      className="bg-[rgba(38,26,64,0.2)] z-10 w-full max-w-[330px] overflow-hidden text-base text-white font-normal text-center -mt-5 pt-[17px] pb-[30px] px-[30px] rounded-[15px]"
      role="log"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
