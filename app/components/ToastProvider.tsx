"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type Variant = "success" | "error" | "warn" | "info";
type Position = "bottom-right" | "top-center";

type ToastItem = {
  id: string;
  message: string;
  variant: Variant;
  position: Position;
};

type ToastApi = {
  show: (message: string, variant?: Variant, ms?: number) => void;
  success: (m: string, ms?: number) => void;
  error: (m: string, ms?: number) => void;
  warn: (m: string, ms?: number) => void;
  info: (m: string, ms?: number) => void;
  critical: (m: string, ms?: number) => void; // 👈 untuk error penting
};

const ToastContext = createContext<ToastApi | null>(null);

function uid() {
  return Math.random().toString(36).slice(2);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (
      message: string,
      variant: Variant,
      position: Position,
      ms: number = 1500
    ) => {
      const id = uid();

      setItems((prev) => {
        const next = [...prev, { id, message, variant, position }];
        return next.slice(-5);
      });

      setTimeout(() => remove(id), ms);
    },
    [remove]
  );

  const api = useMemo<ToastApi>(
    () => ({
      show: (m, v = "info", ms) => push(m, v, "bottom-right", ms),
      success: (m, ms) => push(m, "success", "top-center", ms ?? 3000),
      error: (m, ms) => push(m, "error", "bottom-right", ms),
      warn: (m, ms) => push(m, "warn", "bottom-right", ms),
      info: (m, ms) => push(m, "info", "bottom-right", ms),
      critical: (m, ms) => push(m, "error", "top-center", ms ?? 2500),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Bottom Right */}
      <div className="toastStack bottom-right">
        {items
          .filter((t) => t.position === "bottom-right")
          .map((t) => (
            <div key={t.id} className={`toast toast--${t.variant}`}>
              <div className="toastIcon">
                {t.variant === "success"
                  ? "✓"
                  : t.variant === "error"
                  ? "!"
                  : t.variant === "warn"
                  ? "⚠"
                  : "i"}
              </div>
              <div className="toastMsg">{t.message}</div>
            </div>
          ))}
      </div>

      {/* TOP CENTER */}
      <div className="toastStack top-center">
        {items
          .filter((t) => t.position === "top-center")
          .map((t) => (
            <div key={t.id} className={`toast toast--${t.variant === 'error' ? 'critical' : t.variant}`}>
              <div className="toastIcon">
                {t.variant === "success"
                  ? "✓"
                  : t.variant === "error"
                  ? "!"
                  : t.variant === "warn"
                  ? "⚠"
                  : "i"}
              </div>
              <div className="toastMsg">{t.message}</div>
            </div>
          ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
