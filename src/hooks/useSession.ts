"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/ToastProvider";

const LS_KEY = "autosage_session_id";

/**
 * Manages a persistent session ID.
 *
 * On first mount, checks localStorage for an existing session ID.
 * If none found, creates a new session via POST /api/session and
 * persists the returned ID to localStorage.
 * If DB is degraded, shows an amber toast warning.
 */
export function useSession() {
  const [sessionId, setSessionId] = useState<string>("");

  const initSession = async (city = "delhi"): Promise<string> => {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city }),
    });
    const data = await res.json() as { id: string; degraded?: boolean };
    if (data.degraded) {
      toast("Session won't be saved — database unavailable.", "warning");
    }
    localStorage.setItem(LS_KEY, data.id);
    setSessionId(data.id);
    return data.id;
  };

  const updateSession = async (payload: Record<string, unknown>) => {
    if (!sessionId) return;
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sessionId, ...payload }),
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      setSessionId(stored);
    } else {
      initSession().catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sessionId, initSession, updateSession };
}
