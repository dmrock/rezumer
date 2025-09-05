"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card } from "@/components/ui/card";

type Stage = "applied" | "hr_call" | "tech_interview" | "offer" | "rejected";

const STAGES: { key: Stage; label: string }[] = [
  { key: "applied", label: "Total" },
  { key: "hr_call", label: "HR Call" },
  { key: "tech_interview", label: "Tech" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
];

function isSameMonth(dateStr: string, ref: Date) {
  const d = new Date(dateStr);
  return d.getUTCFullYear() === ref.getUTCFullYear() && d.getUTCMonth() === ref.getUTCMonth();
}

function pct(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function ApplicationsStats() {
  const applications = useQuery(api.applications.listApplications) ?? [];
  const now = new Date();

  const counts = STAGES.reduce(
    (acc, s) => {
      acc.all[s.key] = 0;
      acc.month[s.key] = 0;
      return acc;
    },
    { all: {} as Record<Stage, number>, month: {} as Record<Stage, number> },
  );

  for (const a of applications) {
    const stage = (a.stage || "applied") as Stage;
    if (stage in counts.all) counts.all[stage]! += 1;
    if (isSameMonth(a.date, now) && stage in counts.month) counts.month[stage]! += 1;
  }
  // Denominators are total submissions (not just current stage = applied)
  const totalAll = applications.length;
  const totalMonth = applications.filter((a) => isSameMonth(a.date, now)).length;

  return (
    <div className="mb-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {STAGES.map((s) => {
          // For the first block (Applied) show total submissions
          const isApplied = s.key === "applied";
          const allVal = isApplied ? totalAll : counts.all[s.key] || 0;
          const monthVal = isApplied ? totalMonth : counts.month[s.key] || 0;
          const showPct = !isApplied;
          const allPct = showPct ? pct(allVal, totalAll) : undefined;
          const monthPct = showPct ? pct(monthVal, totalMonth) : undefined;
          return (
            <Card key={s.key} className="border-border bg-card/60 border p-3 backdrop-blur">
              <div className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
                {s.label}
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="text-muted-foreground text-[11px]">This month</div>
                  <div className="text-2xl leading-tight font-semibold">
                    {monthVal}
                    {showPct && (
                      <span className="text-muted-foreground ml-2 text-xs">{monthPct}%</span>
                    )}
                  </div>
                </div>
                <div className="text-muted-foreground">/</div>
                <div className="text-right">
                  <div className="text-muted-foreground text-[11px]">All time</div>
                  <div className="text-2xl leading-tight font-semibold">
                    {allVal}
                    {showPct && (
                      <span className="text-muted-foreground ml-2 text-xs">{allPct}%</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
