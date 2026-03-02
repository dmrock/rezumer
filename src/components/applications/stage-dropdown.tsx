"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { STAGES, BADGE_BASE, STAGE_META } from "@/lib/constants";
import type { Stage } from "@/lib/constants";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

type ApplicationDoc = Doc<"applications">;

interface StageDropdownProps {
  app: ApplicationDoc;
  stageMenuFor: Id<"applications"> | null;
  setStageMenuFor: (id: Id<"applications"> | null) => void;
  stageMenuPos: {
    top?: number;
    bottom?: number;
    left: number;
    maxHeight: number;
  } | null;
  setStageMenuPos: (
    pos: { top?: number; bottom?: number; left: number; maxHeight: number } | null,
  ) => void;
  savingStage: Id<"applications"> | null;
  onChangeStage: (id: Id<"applications">, stage: Stage) => Promise<void>;
}

export function StageDropdown({
  app,
  stageMenuFor,
  setStageMenuFor,
  stageMenuPos,
  setStageMenuPos,
  savingStage,
  onChangeStage,
}: StageDropdownProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuWidth = 176; // w-44
    const gap = 8;
    const vw = window.innerWidth;
    const left = Math.min(Math.max(8, rect.right - menuWidth), vw - menuWidth - 8);
    const itemH = 36;
    const chrome = 8;
    const estimatedHeight = itemH * STAGES.length + chrome;
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const placeAbove = spaceBelow < Math.min(estimatedHeight, spaceAbove);
    const maxHeight = Math.max(
      120,
      Math.min(estimatedHeight, placeAbove ? spaceAbove - 8 : spaceBelow - 8),
    );
    const top = placeAbove ? undefined : rect.bottom + gap;
    const bottom = placeAbove ? Math.max(8, window.innerHeight - rect.top + gap) : undefined;

    if (stageMenuFor === app._id) {
      setStageMenuFor(null);
      setStageMenuPos(null);
    } else {
      setStageMenuFor(app._id);
      setStageMenuPos({ top, bottom, left, maxHeight });
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      <span className={`${BADGE_BASE} ${STAGE_META[(app.stage as Stage) || "applied"].className}`}>
        {STAGE_META[(app.stage as Stage) || "applied"].label}
      </span>
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7"
        aria-label="Change stage"
        title="Change stage"
        aria-expanded={stageMenuFor === app._id}
        disabled={savingStage !== null}
        onClick={handleClick}
      >
        <ChevronDown className="size-4" />
      </Button>
      {stageMenuFor === app._id && (
        <>
          <div className="fixed inset-0 z-[999]" onClick={() => setStageMenuFor(null)} />
          <div
            className="border-border bg-popover text-popover-foreground fixed z-[1000] w-44 overflow-auto rounded-md border p-1 shadow-md"
            role="menu"
            style={{
              top: stageMenuPos?.top,
              bottom: stageMenuPos?.bottom,
              left: stageMenuPos?.left ?? 0,
              maxHeight: stageMenuPos?.maxHeight ?? 240,
            }}
          >
            {STAGES.map((s) => (
              <button
                key={s}
                type="button"
                className="hover:bg-accent hover:text-accent-foreground w-full rounded px-2 py-1.5 text-left text-sm disabled:opacity-50"
                disabled={savingStage !== null || s === (app.stage as Stage)}
                onClick={async () => {
                  await onChangeStage(app._id, s);
                  setStageMenuFor(null);
                }}
              >
                {STAGE_META[s].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
