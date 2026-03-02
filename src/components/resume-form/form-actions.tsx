"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  submitLabel: string;
  submittingLabel: string;
}

export function FormActions({
  isSubmitting,
  onCancel,
  submitLabel,
  submittingLabel,
}: FormActionsProps) {
  return (
    <div className="bg-card flex justify-end gap-4 rounded-lg border p-6">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} size="lg">
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting} size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {submittingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}
