"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Id } from "../../../convex/_generated/dataModel";

const STAGES = [
  "applied",
  "hr_call",
  "tech_interview",
  "offer",
  "rejected",
  "ghosted",
  "rejected_no_interview",
] as const;
type Stage = (typeof STAGES)[number];
const STAGE_META: Record<Stage, { label: string; className: string }> = {
  applied: {
    label: "Applied",
    className:
      "border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300",
  },
  hr_call: {
    label: "HR Call",
    className:
      "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  tech_interview: {
    label: "Tech",
    className:
      "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },
  offer: {
    label: "Offer",
    className:
      "border-green-300 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  rejected: {
    label: "Rejected",
    className:
      "border-red-300 bg-red-100 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400",
  },
  ghosted: {
    label: "Ghosted",
    className:
      "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300",
  },
  rejected_no_interview: {
    label: "No Interview",
    className:
      "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400",
  },
};
const BADGE_BASE =
  "inline-flex h-7 items-center rounded border px-2 text-sm font-medium whitespace-nowrap";
type ApplicationEditable = {
  company: string;
  jobTitle: string;
  salary: string; // keep as string while editing
  stage: Stage;
  date: string;
  notes: string;
};

export function ApplicationsClient() {
  const applications = useQuery(api.applications.listApplications) ?? [];
  const createApplication = useMutation(api.applications.createApplication);
  const updateApplication = useMutation(api.applications.updateApplication);
  const deleteApplication = useMutation(api.applications.deleteApplication);

  // Add form state
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    company: "",
    jobTitle: "",
    salary: "",
    stage: "applied",
    date: today,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingAppId, setEditingAppId] = useState<Id<"applications"> | null>(null);
  const [savingStage, setSavingStage] = useState<Id<"applications"> | null>(null);
  const [stageMenuFor, setStageMenuFor] = useState<Id<"applications"> | null>(null);
  const [stageMenuPos, setStageMenuPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    maxHeight: number;
  } | null>(null);
  const [errors, setErrors] = useState<{ salary?: string }>({});

  // Listen to header button to open the modal
  React.useEffect(() => {
    const handler = () => {
      // open in create mode
      setEditingAppId(null);
      setForm({ company: "", jobTitle: "", salary: "", stage: "applied", date: today, notes: "" });
      setOpen(true);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("open-add-application", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("open-add-application", handler);
      }
    };
  }, []);

  // Close stage dropdown on Escape
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStageMenuFor(null);
    };
    if (typeof window !== "undefined") window.addEventListener("keydown", onKey);
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Close dropdown on scroll/resize to avoid misalignment
  React.useEffect(() => {
    if (!stageMenuFor) return;
    const close = () => setStageMenuFor(null);
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", close, true);
      window.addEventListener("resize", close);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", close, true);
        window.removeEventListener("resize", close);
      }
    };
  }, [stageMenuFor]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Validate salary if provided
      const salaryStr = form.salary.trim();
      let parsedSalary: number | undefined = undefined;
      if (salaryStr !== "") {
        const n = Number(salaryStr);
        if (!Number.isFinite(n) || n < 0) {
          setErrors((prev) => ({ ...prev, salary: "Enter a valid non-negative number" }));
          return;
        }
        parsedSalary = n;
      } else {
        // clear previous errors when user emptied the field
        if (errors.salary) setErrors((prev) => ({ ...prev, salary: undefined }));
      }
      const base = {
        company: form.company.trim(),
        jobTitle: form.jobTitle.trim(),
        stage: form.stage,
        date: form.date,
        notes: form.notes,
      };
      const salaryPatch =
        parsedSalary !== undefined
          ? { salary: parsedSalary }
          : // when editing and user cleared the field, send clear flag
            editingAppId
            ? { clearSalary: true }
            : {};
      if (editingAppId) {
        await updateApplication({ id: editingAppId, ...base, ...salaryPatch });
      } else {
        await createApplication({ ...base, ...salaryPatch });
      }
      // reset after submit
      setEditingAppId(null);
      setForm({ company: "", jobTitle: "", salary: "", stage: "applied", date: today, notes: "" });
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  function openEditModal(id: Id<"applications">) {
    const a = applications.find((x) => x._id === id);
    if (!a) return;
    setEditingAppId(id);
    setForm({
      company: a.company,
      jobTitle: a.jobTitle,
      salary: a.salary != null ? String(a.salary) : "",
      stage: (a.stage as Stage) ?? "applied",
      date: a.date,
      notes: a.notes,
    });
    setOpen(true);
  }

  // Inline change for Stage column
  async function changeStage(id: Id<"applications">, stage: Stage) {
    try {
      setSavingStage(id);
      await updateApplication({ id, stage });
    } finally {
      setSavingStage(null);
    }
  }

  async function remove(id: Id<"applications">) {
    await deleteApplication({ id });
  }

  return (
    <div className="space-y-6">
      {/* Add application modal - opened from header button */}
      <div className="flex justify-end">
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              // closing — reset state
              setEditingAppId(null);
              setForm({
                company: "",
                jobTitle: "",
                salary: "",
                stage: "applied",
                date: today,
                notes: "",
              });
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAppId ? "Edit application" : "Add application"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-6">
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
                />
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
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? editingAppId
                      ? "Saving..."
                      : "Adding..."
                    : editingAppId
                      ? "Save"
                      : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card className="border-border bg-card border p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-border border-b">
              <tr>
                <th className="p-3">Company</th>
                <th className="p-3">Job Title</th>
                <th className="p-3">Annual Salary</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Date</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {applications.map((a) => {
                return (
                  <tr key={a._id} className="hover:bg-accent/50">
                    <td className="align-center p-2">{a.company}</td>
                    <td className="align-center p-2">{a.jobTitle}</td>
                    <td className="align-center p-2">
                      {a.salary != null ? `${Number(a.salary).toLocaleString()}` : "—"}
                    </td>
                    <td className="align-center p-2">
                      <div className="relative flex items-center gap-2">
                        <span
                          className={`${BADGE_BASE} ${STAGE_META[(a.stage as Stage) || "applied"].className}`}
                        >
                          {STAGE_META[(a.stage as Stage) || "applied"].label}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          aria-label="Change stage"
                          title="Change stage"
                          aria-expanded={stageMenuFor === a._id}
                          disabled={savingStage !== null}
                          onClick={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            const menuWidth = 176; // w-44
                            const gap = 8; // space between button and menu
                            const vw = window.innerWidth;
                            const left = Math.min(
                              Math.max(8, rect.right - menuWidth),
                              vw - menuWidth - 8,
                            );
                            // estimate menu height based on items
                            const itemH = 36; // ~h per item (text-sm + padding)
                            const chrome = 8; // container padding/border
                            const estimatedHeight = itemH * STAGES.length + chrome;
                            const vh = window.innerHeight;
                            const spaceBelow = vh - rect.bottom - gap;
                            const spaceAbove = rect.top - gap;
                            const placeAbove = spaceBelow < Math.min(estimatedHeight, spaceAbove);
                            const maxHeight = Math.max(
                              120,
                              Math.min(
                                estimatedHeight,
                                placeAbove ? spaceAbove - 8 : spaceBelow - 8,
                              ),
                            );
                            const top = placeAbove ? undefined : rect.bottom + gap;
                            const bottom = placeAbove
                              ? Math.max(8, window.innerHeight - rect.top + gap)
                              : undefined;
                            setStageMenuFor((cur) => {
                              const next = cur === a._id ? null : a._id;
                              if (next) setStageMenuPos({ top, bottom, left, maxHeight });
                              else setStageMenuPos(null);
                              return next;
                            });
                          }}
                        >
                          <ChevronDown className="size-4" />
                        </Button>
                        {stageMenuFor === a._id && (
                          <>
                            {/* overlay to close on outside click */}
                            <div
                              className="fixed inset-0 z-[999]"
                              onClick={() => setStageMenuFor(null)}
                            />
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
                                  disabled={savingStage !== null || s === (a.stage as Stage)}
                                  onClick={async () => {
                                    await changeStage(a._id, s as Stage);
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
                    </td>
                    <td className="align-center p-2">{a.date}</td>
                    <td className="align-center p-2">
                      <span className="line-clamp-2 max-w-[28rem] break-words">{a.notes}</span>
                    </td>
                    <td className="align-center p-2">
                      <div className="flex justify-end gap-2">
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openEditModal(a._id)}
                            aria-label="Edit"
                            title="Edit"
                            className="hover:cursor-pointer"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              if (confirm(`Delete application for ${a.company}?`)) {
                                remove(a._id);
                              }
                            }}
                            aria-label="Delete"
                            title="Delete"
                            className="border-red-200 bg-red-50 text-red-600 hover:cursor-pointer hover:bg-red-100 hover:text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted-foreground p-8 text-center">
                    No applications yet. Use the “Add application” button above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
