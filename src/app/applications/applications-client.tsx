"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronDown, ChevronUp, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Id, Doc } from "../../../convex/_generated/dataModel";
type ApplicationDoc = Doc<"applications">;

// Local date helper: returns YYYY-MM-DD using local timezone
function nowLocalYMD(d: Date = new Date()): string {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const STAGES = [
  "applied",
  "cv_rejected",
  "hr_call",
  "interview",
  "offer",
  "rejected",
  "ghosted",
] as const;
type Stage = (typeof STAGES)[number];
const STAGE_META: Record<Stage, { label: string; className: string }> = {
  applied: {
    label: "Applied",
    className: "border-gray-700 bg-gray-800/40 text-gray-300",
  },
  cv_rejected: {
    label: "CV Rejected",
    className: "border-rose-900/50 bg-rose-950/40 text-rose-400",
  },
  hr_call: {
    label: "HR Call",
    className: "border-blue-700 bg-blue-900/40 text-blue-300",
  },
  interview: {
    label: "Interview",
    className: "border-violet-700 bg-violet-900/40 text-violet-300",
  },
  offer: {
    label: "Offer",
    className: "border-green-700 bg-green-900/40 text-green-300",
  },
  rejected: {
    label: "Rejected",
    className: "border-red-900/50 bg-red-950/40 text-red-400",
  },
  ghosted: {
    label: "Ghosted",
    className: "border-zinc-700 bg-zinc-900/40 text-zinc-300",
  },
};
const BADGE_BASE =
  "inline-flex h-7 items-center rounded border px-2 text-sm font-medium whitespace-nowrap";

export function ApplicationsClient() {
  // Explicitly type the query result to avoid implicit any usage later.
  const applications = useQuery(api.applications.listApplications) as ApplicationDoc[] | undefined;
  const createApplication = useMutation(api.applications.createApplication);
  const updateApplication = useMutation(api.applications.updateApplication);
  const deleteApplication = useMutation(api.applications.deleteApplication);
  const toggleFavorite = useMutation(api.applications.toggleFavorite);

  // Sorting/filter state (default newest first)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const router = useRouter();
  const searchParams = useSearchParams();
  const onlyFavorites = (searchParams?.get("fav") ?? "") === "1";
  const onlyThisMonth = (searchParams?.get("month") ?? "") === "1";
  function setOnlyFavorites(next: boolean) {
    const sp = new URLSearchParams(searchParams?.toString() || "");
    if (next) sp.set("fav", "1");
    else sp.delete("fav");
    router.replace("?" + sp.toString());
  }

  // Compute filtered + sorted view (YYYY-MM-DD strings compare chronologically)
  const applicationsSorted = React.useMemo(() => {
    if (!applications) return [] as ApplicationDoc[];
    const baseFav = onlyFavorites ? applications.filter((a) => !!a.favorite) : applications;
    // If month filter is active, restrict to items whose date is in current month (UTC, to match stats)
    const now = new Date();
    const inSameUtcMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
    };
    const base = onlyThisMonth ? baseFav.filter((a) => inSameUtcMonth(a.date)) : baseFav;
    const sign = sortDir === "desc" ? -1 : 1; // when desc, reverse chronological
    return [...base].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -sign : sign;
      // Stable tie-breakers to avoid jitter when dates match
      const ca: number = a._creationTime ?? 0;
      const cb: number = b._creationTime ?? 0;
      if (ca !== cb) return (ca - cb) * sign;
      return String(a._id).localeCompare(String(b._id)) * sign;
    });
  }, [applications, onlyFavorites, onlyThisMonth, sortDir]);

  const isLoading = applications === undefined;

  // Add form state (dates use local timezone via nowLocalYMD)
  const [form, setForm] = useState({
    company: "",
    jobTitle: "",
    salary: "",
    stage: "applied",
    date: nowLocalYMD(),
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
  const [limitError, setLimitError] = useState<string | null>(null);

  // Listen to header button to open the modal
  React.useEffect(() => {
    // Capture today's date at effect run to avoid depending on 'today' variable.
    const handler = () => {
      setEditingAppId(null);
      setForm({
        company: "",
        jobTitle: "",
        salary: "",
        stage: "applied",
        date: nowLocalYMD(),
        notes: "",
      });
      setOpen(true);
    };
    if (typeof window !== "undefined") window.addEventListener("open-add-application", handler);
    return () => {
      if (typeof window !== "undefined")
        window.removeEventListener("open-add-application", handler);
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

  // Close stage dropdown on scroll/resize
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
      setLimitError(null);
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
        try {
          await createApplication({ ...base, ...salaryPatch });
        } catch (err) {
          const message = (() => {
            if (typeof err === "string") return err;
            if (err && typeof err === "object") {
              const maybe: unknown = (err as { data?: unknown }).data;
              if (maybe && typeof maybe === "object" && "message" in maybe) {
                const m = (maybe as { message?: unknown }).message;
                if (typeof m === "string") return m;
              }
              if ("message" in err) {
                const m = (err as { message?: unknown }).message;
                if (typeof m === "string") return m;
              }
            }
            return "";
          })();
          if (message.includes("APPLICATION_LIMIT_REACHED")) {
            setLimitError(
              "You reached the limit of 200 applications. Please delete some existing entries before adding a new one.",
            );
            return; // don't close modal
          }
          throw err; // rethrow unknown
        }
      }
      // Reset after submit
      setEditingAppId(null);
      setForm({
        company: "",
        jobTitle: "",
        salary: "",
        stage: "applied",
        date: nowLocalYMD(),
        notes: "",
      });
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  function openEditModal(id: Id<"applications">) {
    if (!applications) return; // still loading
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
      {/* Add application modal (opened via header button) */}
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
                date: nowLocalYMD(),
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
              {limitError && (
                <p className="mt-2 text-sm text-red-600 md:col-span-6">{limitError}</p>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Favorites filter ABOVE the table (right-aligned) */}
      <div className="mt-2 mb-4 flex justify-end gap-4 text-sm">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="favoritesFilter"
            value="all"
            checked={!onlyFavorites}
            onChange={() => setOnlyFavorites(false)}
            className="accent-primary h-4 w-4 cursor-pointer"
          />
          <span className={!onlyFavorites ? "font-medium" : "text-muted-foreground"}>All</span>
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="favoritesFilter"
            value="favorites"
            checked={onlyFavorites}
            onChange={() => setOnlyFavorites(true)}
            className="accent-primary h-4 w-4 cursor-pointer"
          />
          <span className={onlyFavorites ? "font-medium" : "text-muted-foreground"}>Favorites</span>
        </label>
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
                <th className="p-3">
                  <button
                    type="button"
                    className="hover:text-foreground group inline-flex cursor-pointer items-center gap-1 text-inherit"
                    onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                    aria-label={
                      sortDir === "desc" ? "Sort by date ascending" : "Sort by date descending"
                    }
                    title={
                      sortDir === "desc" ? "Sort by date ascending" : "Sort by date descending"
                    }
                  >
                    <span>Date</span>
                    {sortDir === "desc" ? (
                      <ChevronDown className="size-4 opacity-70 group-hover:opacity-100" />
                    ) : (
                      <ChevronUp className="size-4 opacity-70 group-hover:opacity-100" />
                    )}
                  </button>
                </th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="hover:bg-accent/50">
                    <td className="p-2">
                      <div className="bg-muted h-4 w-3/5 animate-pulse rounded" />
                    </td>
                    <td className="p-2">
                      <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
                    </td>
                    <td className="p-2">
                      <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
                    </td>
                    <td className="p-2">
                      <div className="bg-muted h-7 w-24 animate-pulse rounded" />
                    </td>
                    <td className="p-2">
                      <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                    </td>
                    <td className="p-2">
                      <div className="bg-muted h-4 w-4/5 animate-pulse rounded" />
                    </td>
                    <td className="p-2">
                      <div className="ml-auto flex justify-end gap-2">
                        <div className="bg-muted h-7 w-7 animate-pulse rounded-md" />
                        <div className="bg-muted h-7 w-7 animate-pulse rounded-md" />
                        <div className="bg-muted h-7 w-7 animate-pulse rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  {applicationsSorted.map((a) => {
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
                                const rect = (
                                  e.currentTarget as HTMLElement
                                ).getBoundingClientRect();
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
                                const placeAbove =
                                  spaceBelow < Math.min(estimatedHeight, spaceAbove);
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
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => toggleFavorite({ id: a._id, value: !a.favorite })}
                              aria-label={a.favorite ? "Unfavorite" : "Favorite"}
                              title={a.favorite ? "Unfavorite" : "Favorite"}
                              className={
                                "transition-colors hover:cursor-pointer " +
                                (a.favorite
                                  ? "border-yellow-600/40 bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50"
                                  : "text-muted-foreground border-yellow-700/40 hover:!bg-yellow-900/50")
                              }
                            >
                              <Star
                                className={
                                  "size-4 " +
                                  (a.favorite
                                    ? "fill-yellow-500 stroke-yellow-400"
                                    : "stroke-current")
                                }
                              />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => openEditModal(a._id)}
                              aria-label="Edit"
                              title="Edit"
                              className="text-muted-foreground border-yellow-700/40 transition-colors hover:cursor-pointer hover:!bg-blue-900/30 hover:!text-blue-400"
                            >
                              <Pencil className="size-4 stroke-current" />
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
                              className="text-muted-foreground border-yellow-700/40 transition-colors hover:cursor-pointer hover:!bg-red-950/40 hover:!text-red-400"
                            >
                              <Trash2 className="size-4 stroke-current" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {applicationsSorted.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-muted-foreground p-8 text-center">
                        {onlyFavorites && onlyThisMonth
                          ? "No favorite applications this month. Switch to All time or All to see more."
                          : onlyThisMonth
                            ? "No applications this month. Switch to All time to see everything."
                            : onlyFavorites
                              ? "No favorite applications yet. Switch to All to see everything."
                              : "No applications yet. Use the “Add application” button above."}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
