"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ApplicationFormModal } from "@/components/applications/application-form-modal";
import { ApplicationRow } from "@/components/applications/application-row";
import type { ApplicationFormState } from "@/components/applications/application-form-modal";
import { getDefaultCurrency } from "@/lib/currency";
import { DEFAULT_CURRENCY, CURRENCY_SYMBOLS } from "@/lib/constants";
import type { Stage, Currency } from "@/lib/constants";
import { MSG_APPLICATION_LIMIT, MSG_SALARY_INVALID, msgConfirmDeleteApp } from "@/lib/messages";
import type { Id, Doc } from "../../../convex/_generated/dataModel";

type ApplicationDoc = Doc<"applications">;

// Local date helper: returns YYYY-MM-DD using local timezone
function nowLocalYMD(d: Date = new Date()): string {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function makeEmptyForm(): ApplicationFormState {
  return {
    company: "",
    jobTitle: "",
    salary: "",
    currency: getDefaultCurrency(),
    stage: "applied",
    date: nowLocalYMD(),
    notes: "",
  };
}

export function ApplicationsClient() {
  const applications = useQuery(api.applications.listApplications) as ApplicationDoc[] | undefined;
  const createApplication = useMutation(api.applications.createApplication);
  const updateApplication = useMutation(api.applications.updateApplication);
  const deleteApplication = useMutation(api.applications.deleteApplication);
  const toggleFavorite = useMutation(api.applications.toggleFavorite);

  // Sorting/filter state
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

  // Form state
  const [form, setForm] = useState<ApplicationFormState>(makeEmptyForm);
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

  // Confirm delete state
  const [confirmDelete, setConfirmDelete] = useState<{
    id: Id<"applications">;
    company: string;
  } | null>(null);

  // Sorted & filtered view
  const applicationsSorted = React.useMemo(() => {
    if (!applications) return [] as ApplicationDoc[];
    const baseFav = onlyFavorites ? applications.filter((a) => !!a.favorite) : applications;
    const now = new Date();
    const inSameUtcMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
    };
    const base = onlyThisMonth ? baseFav.filter((a) => inSameUtcMonth(a.date)) : baseFav;
    const sign = sortDir === "desc" ? -1 : 1;
    return [...base].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -sign : sign;
      const ca: number = a._creationTime ?? 0;
      const cb: number = b._creationTime ?? 0;
      if (ca !== cb) return (ca - cb) * sign;
      return String(a._id).localeCompare(String(b._id)) * sign;
    });
  }, [applications, onlyFavorites, onlyThisMonth, sortDir]);

  const isLoading = applications === undefined;

  // Listen to header button to open the modal
  React.useEffect(() => {
    const handler = () => {
      setEditingAppId(null);
      setForm(makeEmptyForm());
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
      const salaryStr = form.salary.trim();
      let parsedSalary: number | undefined = undefined;
      if (salaryStr !== "") {
        const n = Number(salaryStr);
        if (!Number.isFinite(n) || n < 0) {
          setErrors((prev) => ({ ...prev, salary: MSG_SALARY_INVALID }));
          return;
        }
        parsedSalary = n;
      } else {
        if (errors.salary) setErrors((prev) => ({ ...prev, salary: undefined }));
      }
      const base = {
        company: form.company.trim(),
        jobTitle: form.jobTitle.trim(),
        stage: form.stage,
        date: form.date,
        notes: form.notes,
        currency: form.currency,
      };
      const salaryPatch =
        parsedSalary !== undefined
          ? { salary: parsedSalary }
          : editingAppId
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
            setLimitError(MSG_APPLICATION_LIMIT);
            return;
          }
          throw err;
        }
      }
      setEditingAppId(null);
      setForm(makeEmptyForm());
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  function openEditModal(id: Id<"applications">) {
    if (!applications) return;
    const a = applications.find((x) => x._id === id);
    if (!a) return;
    setEditingAppId(id);
    setForm({
      company: a.company,
      jobTitle: a.jobTitle,
      salary: a.salary != null ? String(a.salary) : "",
      currency: (a.currency as Currency) || DEFAULT_CURRENCY,
      stage: (a.stage as Stage) ?? "applied",
      date: a.date,
      notes: a.notes,
    });
    setOpen(true);
  }

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
      <div className="flex justify-end">
        <ApplicationFormModal
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setEditingAppId(null);
              setForm(makeEmptyForm());
            }
          }}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          submitting={submitting}
          isEditing={!!editingAppId}
          errors={errors}
          setErrors={setErrors}
          limitError={limitError}
        />
      </div>

      {/* Favorites filter */}
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
                  {applicationsSorted.map((a) => (
                    <ApplicationRow
                      key={a._id}
                      app={a}
                      stageMenuFor={stageMenuFor}
                      setStageMenuFor={setStageMenuFor}
                      stageMenuPos={stageMenuPos}
                      setStageMenuPos={setStageMenuPos}
                      savingStage={savingStage}
                      onChangeStage={changeStage}
                      onToggleFavorite={(id, value) => toggleFavorite({ id, value })}
                      onEdit={openEditModal}
                      onDelete={(id, company) => setConfirmDelete({ id, company })}
                    />
                  ))}
                  {applicationsSorted.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-muted-foreground p-8 text-center">
                        {onlyFavorites && onlyThisMonth
                          ? "No favorite applications this month. Switch to All time or All to see more."
                          : onlyThisMonth
                            ? "No applications this month. Switch to All time to see everything."
                            : onlyFavorites
                              ? "No favorite applications yet. Switch to All to see everything."
                              : "No applications yet. Use the \u201CAdd application\u201D button above."}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(v) => {
          if (!v) setConfirmDelete(null);
        }}
        title="Delete Application"
        description={confirmDelete ? msgConfirmDeleteApp(confirmDelete.company) : ""}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (confirmDelete) remove(confirmDelete.id);
        }}
      />
    </div>
  );
}
