"use client";

import { useRef, useEffect, useState, KeyboardEvent } from "react";
import type { ShortlistItem } from "@/types";
import { useChat } from "@/hooks/useChat";
import { useCity } from "@/hooks/useCity";
import { useSession } from "@/hooks/useSession";
import { ChatMessage } from "./ChatMessage";
import { SuggestedQuestions } from "./SuggestedQuestions";

interface ChatDrawerProps {
  shortlist?: ShortlistItem[];
  context?: "results" | "detail";
  carName?: string;
  popularComparison?: string;
}

export function ChatDrawer({
  shortlist = [],
  context = "results",
  carName,
  popularComparison,
}: ChatDrawerProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { city } = useCity();
  const { sessionId } = useSession();
  const { messages, sendMessage, loading } = useChat();
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    sendMessage(text, sessionId, shortlist, city);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (q: string) => {
    sendMessage(q, sessionId, shortlist, city);
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open AutoSage chat"}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-navy text-white rounded-full shadow-xl flex items-center justify-center hover:bg-brand-navy/90 transition-all hover:scale-105"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full md:w-[400px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-brand-navy text-white">
          <div>
            <p className="font-semibold text-sm">AutoSage Chat</p>
            <p className="text-xs text-white/60">Ask anything about your shortlist</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message list */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <SuggestedQuestions
              context={context}
              carName={carName}
              popularComparison={popularComparison}
              onSelect={handleSuggestedQuestion}
            />
          )}
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {/* Show suggested after first exchange */}
          {messages.length >= 2 && !loading && (
            <SuggestedQuestions
              context={context}
              carName={carName}
              popularComparison={popularComparison}
              onSelect={handleSuggestedQuestion}
            />
          )}
        </div>

        {/* Input — safe-area-bottom keeps it above soft keyboard on iOS */}
        <div className="border-t border-gray-100 p-3 safe-area-bottom">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any car in your shortlist…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent max-h-28 overflow-y-auto"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="shrink-0 w-10 h-10 rounded-xl bg-brand-navy text-white flex items-center justify-center hover:bg-brand-navy/90 disabled:opacity-40 disabled:pointer-events-none transition-all"
              aria-label="Send message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">Enter to send · Shift+Enter for newline</p>
        </div>
      </div>
    </>
  );
}
