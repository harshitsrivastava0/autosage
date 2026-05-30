"use client";

import { useState } from "react";
import type { ChatMessage, ShortlistItem } from "@/types";
import { toast } from "@/components/ui/ToastProvider";

/**
 * Manages the streaming chat conversation.
 *
 * sendMessage() posts to /api/chat, reads the SSE stream, and appends
 * tokens to the last (assistant) message in real time as they arrive.
 * Final [DONE] sentinel closes the stream cleanly.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (
    text: string,
    sessionId: string,
    shortlist: ShortlistItem[] = [],
    city = "delhi"
  ) => {
    setError(null);
    setLoading(true);

    // Add user message
    const userMsg: ChatMessage = { role: "user", content: text, timestamp: Date.now() };
    // Add empty assistant placeholder that will be filled by streaming
    const assistantMsg: ChatMessage = {
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text, shortlist, city }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Chat request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assembled = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Each SSE line: "data: <token>\n\n"
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const token = line.slice(6); // strip "data: "
          if (token === "[DONE]") break;
          if (token.startsWith("[ERROR:")) {
            setError(token.slice(1, -1));
            break;
          }
          assembled += token;
          // Update last message (the assistant placeholder) in real time
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: assembled,
            };
            return updated;
          });
        }
      }

      // Mark stream complete
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          streaming: false,
        };
        return updated;
      });
    } catch (err) {
      const msg = String(err);
      setError(msg);
      toast("Response cut short — try again.", "warning");
      setMessages((prev) => prev.slice(0, -1)); // Remove failed assistant placeholder
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => setMessages([]);

  return { messages, sendMessage, clearMessages, loading, error };
}
