import type { ChatMessage as ChatMsg } from "@/types";

interface ChatMessageProps {
  message: ChatMsg;
}

/** Typing indicator — 3 pulsing dots while waiting for first token. */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 animate-pulse-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isEmpty = !message.content && message.streaming;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-brand-blue text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-none shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      {/* AS avatar */}
      <div className="w-7 h-7 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        AS
      </div>
      <div className="max-w-[85%] bg-brand-surface text-gray-800 text-sm px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm">
        {isEmpty ? (
          <TypingIndicator />
        ) : (
          <>
            {message.content}
            {message.streaming && (
              <span className="inline-block w-0.5 h-3.5 bg-brand-navy ml-0.5 animate-pulse-dot align-middle" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
