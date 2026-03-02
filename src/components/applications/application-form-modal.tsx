"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CURRENCIES, STAGES, CURRENCY_SYMBOLS, STAGE_META } from "@/lib/constants";
import type { Currency } from "@/lib/constants";

export interface ApplicationFormState {
  company: string;
  jobTitle: string;
  salary: string;
  currency: Currency;
  stage: string;
  date: string;
  notes: string;
}

interface ApplicationFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: ApplicationFormState;
  setForm: React.Dispatch<React.SetStateAction<ApplicationFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  isEditing: boolean;
  errors: { salary?: string };
  setErrors: React.Dispatch<React.SetStateAction<{ salary?: string }>>;
  limitError: string | null;
}

export function ApplicationFormModal({
  open,
  onOpenChange,
  form,
  setForm,
  onSubmit,
  submitting,
  isEditing,
  errors,
  setErrors,
  limitError,
}: ApplicationFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit application" : "Add application"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-6">
          <div className="md:col-span-3">
            <label className="text-muted-foreground mb-1 block text-sm">Company</label>
            <Input
              value={form.company}
              onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))}
              placeholder="Company name"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-muted-foreground mb-1 block text-sm">Job Title</label>
            <Input
              value={form.jobTitle}
              onChange={(e) => setForm((s) => ({ ...s, jobTitle: e.target.value }))}
              placeholder="e.g. Software Engineer"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-muted-foreground mb-1 block text-sm">Annual Salary</label>
            <div className="flex gap-1">
              <select
                aria-label="Currency"
                className="border-input bg-background text-foreground ring-offset-background focus-visible:ring-ring flex h-10 w-16 shrink-0 items-center rounded-md border px-2 text-sm focus:ring-2 focus:outline-none"
                value={form.currency}
                onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value as Currency }))}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {CURRENCY_SYMBOLS[c]}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={form.salary}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((s) => ({ ...s, salary: val }));
                  if (errors.salary) setErrors((prev) => ({ ...prev, salary: undefined }));
                }}
                placeholder="150000"
                className="flex-1"
              />
            </div>
            {errors.salary && <p className="mt-1 text-sm text-red-600">{errors.salary}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="text-muted-foreground mb-1 block text-sm">Stage</label>
            <select
              className="border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={form.stage}
              onChange={(e) => setForm((s) => ({ ...s, stage: e.target.value }))}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_META[s].label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-muted-foreground mb-1 block text-sm">Date</label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
              required
            />
          </div>
          <div className="md:col-span-6">
            <label className="text-muted-foreground mb-1 block text-sm">Notes</label>
            <textarea
              className="border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground min-h-24 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              value={form.notes}
              onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
              placeholder="Any context or links"
            />
          </div>
          <DialogFooter className="md:col-span-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (isEditing ? "Saving..." : "Adding...") : isEditing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
          {limitError && <p className="mt-2 text-sm text-red-600 md:col-span-6">{limitError}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}
