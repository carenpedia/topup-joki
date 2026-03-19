"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

type UiProgressApi = {
  start: () => void;
  done: () => void;
};

const Ctx = createContext<UiProgressApi | null>(null);

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function UiProgressProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sp = useSearchParams();

  const routeKey = useMemo(() => {
    const qs = sp ? sp.toString() : "";
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, sp]);

  const [visible, setVisible] = useState(false);
  const [p, setP] = useState(0);

  const lastKeyRef = useRef("");
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef<number | null>(null);
  const hardStopRef = useRef<number | null>(null);

  const runningRef = useRef(false);
  const startAtRef = useRef(0);
  const fromRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    if (doneRef.current != null) window.clearTimeout(doneRef.current);
    if (hardStopRef.current != null) window.clearTimeout(hardStopRef.current);
    rafRef.current = null;
    doneRef.current = null;
    hardStopRef.current = null;
    runningRef.current = false;
  }, []);

  const animate = useCallback(() => {
    if (!runningRef.current) return;

    const now = performance.now();
    const t = clamp((now - startAtRef.current) / 1600, 0, 1); // 0..1

    // easeOutCubic
    const ease = 1 - Math.pow(1 - t, 3);

    // target max 93% (biar tetep terasa loading)
    const target = 93;
    const base = fromRef.current;

    const next = base + (target - base) * ease;
    setP((prev) => (next > prev ? next : prev)); // jangan turun

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const start = useCallback(() => {
    clearTimers();

    setVisible(true);
    // start dari minimal 10–18 (lebih “premium”)
    const initial = Math.max(10, Math.min(18, p || 0) || 12);
    fromRef.current = initial;
    setP(initial);

    runningRef.current = true;
    startAtRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animate);

    // failsafe: 6 detik auto done biar ga mungkin nyangkut
    hardStopRef.current = window.setTimeout(() => {
      runningRef.current = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      setP(100);
      window.setTimeout(() => {
        setVisible(false);
        setP(0);
      }, 240);
    }, 6000);
  }, [animate, clearTimers, p]);

  const done = useCallback(() => {
    // stop animasi naik pelan
    runningRef.current = false;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    if (hardStopRef.current != null) window.clearTimeout(hardStopRef.current);

    // snap halus ke 100, lalu fade-out
    setP(100);
    doneRef.current = window.setTimeout(() => {
      setVisible(false);
      setP(0);
    }, 240);
  }, []);

  // Auto: hanya kalau routeKey berubah
  useEffect(() => {
    if (!routeKey) return;
    if (lastKeyRef.current === routeKey) return;
    lastKeyRef.current = routeKey;

    start();
    const t = window.setTimeout(() => done(), 520);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  const api = useMemo(() => ({ start, done }), [start, done]);

  return (
    <Ctx.Provider value={api}>
      {children}

      <div className={`gbar ${visible ? "gbar--on" : ""}`} aria-hidden="true">
        <div className="gbar__track">
          {/* pakai transform scaleX biar super smooth */}
          <div
            className="gbar__fill"
            style={{ transform: `scaleX(${clamp(p, 0, 100) / 100})` }}
          />
          <div className="gbar__shimmer" />
          <div className="gbar__tip" style={{ left: `calc(${p}% - 18px)` }} />
        </div>
      </div>
    </Ctx.Provider>
  );
}

export function useUiProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUiProgress must be used inside <UiProgressProvider />");
  return ctx;
}