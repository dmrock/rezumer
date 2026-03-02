"use client";

import { useState, useRef, useCallback } from "react";

export type ToastType = "error" | "success";

export interface ToastState {
  message: string;
  type: ToastType;
}

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastType = "error") => {
      setToast({ message, type });
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => setToast(null), duration);
    },
    [duration],
  );

  const dismissToast = useCallback(() => {
    setToast(null);
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { toast, showToast, dismissToast } as const;
}
