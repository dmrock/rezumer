import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "@/hooks/use-toast";

describe("useToast", () => {
  describe("initial state", () => {
    it("starts with toast === null", () => {
      const { result } = renderHook(() => useToast());
      expect(result.current.toast).toBeNull();
    });
  });

  describe("showToast", () => {
    it("sets toast with message and default type 'error'", () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.showToast("Something broke");
      });
      expect(result.current.toast).toEqual({ message: "Something broke", type: "error" });
    });

    it("sets toast with type 'success' when specified", () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.showToast("Saved!", "success");
      });
      expect(result.current.toast).toEqual({ message: "Saved!", type: "success" });
    });

    it("overwrites the previous toast message", () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.showToast("First");
      });
      act(() => {
        result.current.showToast("Second", "success");
      });
      expect(result.current.toast).toEqual({ message: "Second", type: "success" });
    });
  });

  describe("dismissToast", () => {
    it("sets toast to null", () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.showToast("Hello");
      });
      act(() => {
        result.current.dismissToast();
      });
      expect(result.current.toast).toBeNull();
    });

    it("clears the pending auto-dismiss timeout so toast stays null", () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.showToast("Hello");
      });
      act(() => {
        result.current.dismissToast();
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.toast).toBeNull();
      vi.useRealTimers();
    });
  });

  describe("auto-dismiss timer", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("auto-dismisses toast after default 3000ms", () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.showToast("Test");
      });
      expect(result.current.toast).not.toBeNull();

      act(() => {
        vi.advanceTimersByTime(2999);
      });
      expect(result.current.toast).not.toBeNull();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.toast).toBeNull();
    });

    it("auto-dismisses after custom duration", () => {
      const { result } = renderHook(() => useToast(1000));
      act(() => {
        result.current.showToast("Test");
      });

      act(() => {
        vi.advanceTimersByTime(999);
      });
      expect(result.current.toast).not.toBeNull();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.toast).toBeNull();
    });

    it("resets timer when showToast called again (stale timeout cleared)", () => {
      const { result } = renderHook(() => useToast(3000));
      act(() => {
        result.current.showToast("First");
      });

      // Advance 2000ms — not yet dismissed
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.toast).not.toBeNull();

      // Show a new toast — resets the 3000ms timer
      act(() => {
        result.current.showToast("Second");
      });

      // Advance 2999ms — original timer would have fired but new one hasn't
      act(() => {
        vi.advanceTimersByTime(2999);
      });
      expect(result.current.toast).not.toBeNull();

      // Advance 1ms more — new timer fires
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.toast).toBeNull();
    });
  });
});
