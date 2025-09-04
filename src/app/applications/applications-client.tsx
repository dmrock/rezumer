"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function ApplicationsClient() {
  const applications = useQuery(api.applications.listApplications) ?? [];
  const createApplication = useMutation(api.applications.createApplication);

  const [creating, setCreating] = useState(false);

  async function handleQuickAdd() {
    try {
      setCreating(true);
      await createApplication({
        company: "Acme Corp",
        jobTitle: "Software Engineer",
        salary: 150000,
        stage: "applied",
        date: new Date().toISOString().slice(0, 10),
        notes: "Quick add from button",
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <Card className="border-border bg-card border">
      <div className="border-border flex items-center justify-between border-b p-6">
        <h2 className="text-foreground text-2xl font-semibold">Recent Applications</h2>
        <Button
          onClick={handleQuickAdd}
          disabled={creating}
          className="border-border bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground cursor-pointer shadow-xs"
        >
          <Plus className="mr-2 h-5 w-5" />
          {creating ? "Adding..." : "Quick Add"}
        </Button>
      </div>

      <div className="divide-border divide-y">
        {applications.map((a) => (
          <div key={a._id} className="hover:bg-accent/50 p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-4">
                  <h3 className="text-foreground text-xl font-semibold">{a.jobTitle}</h3>
                  <span className="bg-muted rounded-full px-3 py-1 text-sm font-medium">
                    {a.stage}
                  </span>
                </div>
                <p className="text-foreground mb-1 text-lg">{a.company}</p>
                <div className="text-muted-foreground flex items-center gap-6 text-sm">
                  <span>Applied: {a.date}</span>
                  <span>Salary: $ {Number(a.salary).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {applications.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No applications yet</p>
          <Button
            onClick={handleQuickAdd}
            className="bg-primary text-primary-foreground hover:bg-primary/90 border-0"
          >
            Add Your First Application
          </Button>
        </div>
      )}
    </Card>
  );
}
