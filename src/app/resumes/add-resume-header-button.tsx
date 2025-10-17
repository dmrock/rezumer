"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddResumeHeaderButton() {
  const router = useRouter();

  return (
    <Button
      size="lg"
      className="border-border bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground cursor-pointer shadow-xs"
      onClick={() => router.push("/resumes/new")}
    >
      <Plus className="mr-2 h-5 w-5" />
      Add Resume
    </Button>
  );
}
