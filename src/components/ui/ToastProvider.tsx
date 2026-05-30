"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type ToastType = "info" | "success" | "warning" | "error";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

// Module-level ref so the imperative toast() function can call into the provider
let _addToast: ((message: string, type?: ToastType) => void) | null = null;

/** Imperative API — call toast('message', 'success') from anywhere */
export function toast(message: string, type: ToastType = "info") {
  _addToast?.(message, type);
}

const TYPE_STYLES: Record<ToastType, string> = {
  info: "bg-brand-blue text-white",
  success: "bg-green-600 text-white",
  warning: "bg-amber-500 text-white",
  error: "bg-brand-red text-white",
};

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(item.id), 4000);
    return () => clearTimeout(t);
  }, [item.id, onRemove]);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-sm w-full
        animate-[slideIn_0.25s_ease-out_forwards] ${TYPE_STYLES[item.type]}
      `}
      role="alert"
    >
      <span className="flex-1 text-sm font-medium">{item.message}</span>
      <button
        onClick={() => onRemove(item.id)}
        className="text-white/80 hover:text-white text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register with module-level reference
  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast stack — bottom-right corner */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastItem item={item} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
