"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Id } from "../../../convex/_generated/dataModel";

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
  const [editingId, setEditingId] = useState<Id<"applications"> | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, any>>({});

  const STAGES = ["applied", "hr_call", "tech_interview", "offer", "rejected"] as const;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createApplication({
        company: form.company.trim(),
        jobTitle: form.jobTitle.trim(),
        salary: Number(form.salary) || 0,
        stage: form.stage,
        date: form.date,
        notes: form.notes,
      });
      setForm({ company: "", jobTitle: "", salary: "", stage: "applied", date: today, notes: "" });
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(id: Id<"applications">) {
    const a = applications.find((x) => x._id === id);
    if (!a) return;
    setEditingId(id);
    setEditDraft({
      company: a.company,
      jobTitle: a.jobTitle,
      salary: String(a.salary),
      stage: a.stage,
      date: a.date,
      notes: a.notes,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft({});
  }

  async function saveEdit(id: Id<"applications">) {
    await updateApplication({
      id,
      company: editDraft.company,
      jobTitle: editDraft.jobTitle,
      salary: Number(editDraft.salary) || 0,
      stage: editDraft.stage,
      date: editDraft.date,
      notes: editDraft.notes,
    });
    cancelEdit();
  }

  async function remove(id: Id<"applications">) {
    await deleteApplication({ id });
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <Card className="border-border bg-card border p-6">
        <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-6">
          <div className="md:col-span-2">
            <label className="text-muted-foreground mb-1 block text-sm">Company</label>
            <Input
              value={form.company}
              onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))}
              placeholder="Company name"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-muted-foreground mb-1 block text-sm">Job Title</label>
            <Input
              value={form.jobTitle}
              onChange={(e) => setForm((s) => ({ ...s, jobTitle: e.target.value }))}
              placeholder="e.g. Software Engineer"
              required
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-sm">Salary</label>
            <Input
              type="number"
              min={0}
              value={form.salary}
              onChange={(e) => setForm((s) => ({ ...s, salary: e.target.value }))}
              placeholder="150000"
              required
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-sm">Stage</label>
            <select
              className="border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={form.stage}
              onChange={(e) => setForm((s) => ({ ...s, stage: e.target.value }))}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-sm">Date</label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
              required
            />
          </div>
          <div className="md:col-span-5">
            <label className="text-muted-foreground mb-1 block text-sm">Notes</label>
            <textarea
              className="border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground min-h-24 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              value={form.notes}
              onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
              placeholder="Any context or links"
            />
          </div>
          <div className="flex items-end md:col-span-1">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Table */}
      <Card className="border-border bg-card border p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-border border-b">
              <tr>
                <th className="p-3">Company</th>
                <th className="p-3">Job Title</th>
                <th className="p-3">Salary</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Date</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {applications.map((a) => {
                const isEditing = editingId === a._id;
                return (
                  <tr key={a._id} className="hover:bg-accent/50">
                    <td className="p-3 align-top">
                      {isEditing ? (
                        <Input
                          value={editDraft.company}
                          onChange={(e) => setEditDraft((s) => ({ ...s, company: e.target.value }))}
                        />
                      ) : (
                        a.company
                      )}
                    </td>
                    <td className="p-3 align-top">
                      {isEditing ? (
                        <Input
                          value={editDraft.jobTitle}
                          onChange={(e) =>
                            setEditDraft((s) => ({ ...s, jobTitle: e.target.value }))
                          }
                        />
                      ) : (
                        a.jobTitle
                      )}
                    </td>
                    <td className="p-3 align-top">
                      {isEditing ? (
                        <Input
                          type="number"
                          min={0}
                          value={editDraft.salary}
                          onChange={(e) => setEditDraft((s) => ({ ...s, salary: e.target.value }))}
                        />
                      ) : (
                        `$ ${Number(a.salary).toLocaleString()}`
                      )}
                    </td>
                    <td className="p-3 align-top">
                      {isEditing ? (
                        <select
                          className="border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground h-9 w-full rounded-md border px-2 text-sm focus:ring-2 focus:outline-none"
                          value={editDraft.stage}
                          onChange={(e) => setEditDraft((s) => ({ ...s, stage: e.target.value }))}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        a.stage
                      )}
                    </td>
                    <td className="p-3 align-top">
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editDraft.date}
                          onChange={(e) => setEditDraft((s) => ({ ...s, date: e.target.value }))}
                        />
                      ) : (
                        a.date
                      )}
                    </td>
                    <td className="p-3 align-top">
                      {isEditing ? (
                        <textarea
                          className="border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground h-9 w-full rounded-md border px-2 text-sm focus:ring-2 focus:outline-none"
                          value={editDraft.notes}
                          onChange={(e) => setEditDraft((s) => ({ ...s, notes: e.target.value }))}
                        />
                      ) : (
                        <span className="line-clamp-2 max-w-[28rem] break-words">{a.notes}</span>
                      )}
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button size="sm" onClick={() => saveEdit(a._id)}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => startEdit(a._id)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => remove(a._id)}>
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted-foreground p-8 text-center">
                    No applications yet. Add your first one above.
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
