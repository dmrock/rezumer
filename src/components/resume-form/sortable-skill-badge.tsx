"use client";

import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GripVertical, X } from "lucide-react";

export interface SortableSkillBadgeProps {
  skill: string;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (value: string) => void;
  onRemove: () => void;
  lockDimensions: boolean;
}

export function SortableSkillBadge({
  skill,
  index,
  isEditing,
  onEdit,
  onSave,
  onRemove,
  lockDimensions,
}: SortableSkillBadgeProps) {
  const [editValue, setEditValue] = useState(skill);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState<number | undefined>(undefined);
  const [height, setHeight] = React.useState<number | undefined>(undefined);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `skill-${index}`,
  });

  React.useLayoutEffect(() => {
    if (containerRef.current && !isDragging) {
      setWidth(containerRef.current.offsetWidth);
      setHeight(containerRef.current.offsetHeight);
    }
  }, [skill, isDragging, lockDimensions]);

  const style: React.CSSProperties = {
    transform: isDragging
      ? undefined
      : lockDimensions
        ? undefined
        : CSS.Transform.toString(transform),
    transition: lockDimensions
      ? "none"
      : !isDragging && transform
        ? transition || undefined
        : undefined,
    visibility: isDragging ? "hidden" : undefined,
    width: lockDimensions ? width : undefined,
    height: lockDimensions ? height : undefined,
    contain: lockDimensions ? ("layout paint size" as React.CSSProperties["contain"]) : undefined,
  };

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  useEffect(() => {
    setEditValue(skill);
  }, [skill]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave(editValue);
    } else if (e.key === "Escape") {
      setEditValue(skill);
      onSave(skill);
    }
  };

  if (isEditing) {
    return (
      <div ref={setRefs} style={style} className="inline-flex flex-none">
        <Input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => onSave(editValue)}
          onKeyDown={handleKeyDown}
          className="h-7 w-auto min-w-[100px] px-2 py-0 text-xs"
          placeholder="Enter skill"
        />
      </div>
    );
  }

  return (
    <div ref={setRefs} style={style} className="group inline-flex flex-none items-center gap-1">
      <Badge
        variant="secondary"
        className="hover:bg-secondary/60 cursor-pointer py-1.5 pr-2 pl-1.5 text-sm whitespace-nowrap transition-colors select-none"
        onClick={onEdit}
      >
        <GripVertical
          {...attributes}
          {...listeners}
          className="text-muted-foreground mr-1 h-3.5 w-3.5 cursor-grab active:cursor-grabbing"
        />
        {skill}
      </Badge>
      <button
        type="button"
        onClick={onRemove}
        className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        aria-label="Remove skill"
      >
        <X className="text-muted-foreground hover:text-destructive h-4 w-4" />
      </button>
    </div>
  );
}

export function SkillPlaceholder({ skill }: { skill: string }) {
  return (
    <div className="inline-flex flex-none">
      <Badge
        variant="secondary"
        className="invisible py-1.5 pr-2 pl-1.5 text-sm whitespace-nowrap select-none"
      >
        <GripVertical className="mr-1 h-3.5 w-3.5" />
        {skill}
      </Badge>
    </div>
  );
}
