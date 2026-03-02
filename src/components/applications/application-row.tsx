"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Star } from "lucide-react";
import { BADGE_BASE, STAGE_META, CURRENCY_SYMBOLS, DEFAULT_CURRENCY } from "@/lib/constants";
import type { Stage, Currency } from "@/lib/constants";
import { StageDropdown } from "./stage-dropdown";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

type ApplicationDoc = Doc<"applications">;

interface ApplicationRowProps {
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
  onToggleFavorite: (id: Id<"applications">, value: boolean) => void;
  onEdit: (id: Id<"applications">) => void;
  onDelete: (id: Id<"applications">, company: string) => void;
}

export function ApplicationRow({
  app,
  stageMenuFor,
  setStageMenuFor,
  stageMenuPos,
  setStageMenuPos,
  savingStage,
  onChangeStage,
  onToggleFavorite,
  onEdit,
  onDelete,
}: ApplicationRowProps) {
  return (
    <tr className="hover:bg-accent/50">
      <td className="align-center p-2">{app.company}</td>
      <td className="align-center p-2">{app.jobTitle}</td>
      <td className="align-center p-2">
        {app.salary != null
          ? `${CURRENCY_SYMBOLS[(app.currency as Currency) || DEFAULT_CURRENCY]}${Number(app.salary).toLocaleString()}`
          : "\u2014"}
      </td>
      <td className="align-center p-2">
        <StageDropdown
          app={app}
          stageMenuFor={stageMenuFor}
          setStageMenuFor={setStageMenuFor}
          stageMenuPos={stageMenuPos}
          setStageMenuPos={setStageMenuPos}
          savingStage={savingStage}
          onChangeStage={onChangeStage}
        />
      </td>
      <td className="align-center p-2">{app.date}</td>
      <td className="align-center p-2">
        <span className="line-clamp-2 max-w-[28rem] break-words">{app.notes}</span>
      </td>
      <td className="align-center p-2">
        <div className="flex justify-end gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => onToggleFavorite(app._id, !app.favorite)}
            aria-label={app.favorite ? "Unfavorite" : "Favorite"}
            title={app.favorite ? "Unfavorite" : "Favorite"}
            className={
              "transition-colors hover:cursor-pointer " +
              (app.favorite
                ? "border-yellow-600/40 bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50"
                : "text-muted-foreground border-yellow-700/40 hover:!bg-yellow-900/50 hover:!text-yellow-400")
            }
          >
            <Star
              className={
                "size-4 " + (app.favorite ? "fill-yellow-500 stroke-yellow-400" : "stroke-current")
              }
            />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => onEdit(app._id)}
            aria-label="Edit"
            title="Edit"
            className="text-muted-foreground border-yellow-700/40 transition-colors hover:cursor-pointer hover:!bg-blue-900/30 hover:!text-blue-400"
          >
            <Pencil className="size-4 stroke-current" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => onDelete(app._id, app.company)}
            aria-label="Delete"
            title="Delete"
            className="text-muted-foreground border-yellow-700/40 transition-colors hover:cursor-pointer hover:!bg-red-950/40 hover:!text-red-400"
          >
            <Trash2 className="size-4 stroke-current" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
