"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AddApplicationHeaderButton() {
  return (
    <Button
      size="lg"
      className="border-border bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground cursor-pointer shadow-xs"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("open-add-application"));
        }
      }}
    >
      <Plus className="mr-2 h-5 w-5" />
      Add Application
    </Button>
  );
}
