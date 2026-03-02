"use client";

import type { ToastState } from "@/hooks/use-toast";

interface ToastProps {
  toast: ToastState | null;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  const isError = toast.type === "error";
  const borderClass = isError ? "border-destructive/30" : "border-green-700/30";
  const bgClass = isError ? "bg-destructive/10" : "bg-green-900/10";
  const textClass = isError ? "text-destructive" : "text-green-400";
  const dotClass = isError ? "bg-destructive" : "bg-green-500";

  return (
    <div
      className={`${borderClass} ${bgClass} ${textClass} supports-[backdrop-filter]:${bgClass} pointer-events-none fixed top-4 right-4 z-50 flex max-w-md items-start gap-3 rounded-md border px-4 py-3 text-sm backdrop-blur`}
    >
      <span className={`${dotClass} mt-[2px] inline-block h-2.5 w-2.5 rounded-full`} />
      <p className="pointer-events-auto">{toast.message}</p>
    </div>
  );
}
