"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card } from "@/components/ui/card";

type Stage = "applied" | "hr_call" | "interview" | "offer" | "rejected" | "ghosted" | "cv_rejected";

const STAGES: { key: Stage; label: string }[] = [
  { key: "applied", label: "Total" },
  { key: "cv_rejected", label: "CV Rejected" }, // moved directly after Total per request
  { key: "hr_call", label: "HR Call" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
  { key: "ghosted", label: "Ghosted" },
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
  const [timeframe, setTimeframe] = React.useState<"all" | "month">("all");

  const counts = STAGES.reduce(
    (acc, s) => {
      acc.all[s.key] = 0;
      acc.month[s.key] = 0;
      return acc;
    },
    { all: {} as Record<Stage, number>, month: {} as Record<Stage, number> },
  );

  for (const a of applications) {
    const stage = (a.stage as Stage) || "applied";
    if (stage in counts.all) counts.all[stage]! += 1;
    if (isSameMonth(a.date, now) && stage in counts.month) counts.month[stage]! += 1;
  }
  // Denominators are total submissions (not just current stage = applied)
  const totalAll = applications.length;
  const totalMonth = applications.filter((a) => isSameMonth(a.date, now)).length;

  return (
    <div className="mb-3">
      <div className="mb-4 flex gap-4 text-sm">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="timeframe"
            value="all"
            checked={timeframe === "all"}
            onChange={() => setTimeframe("all")}
            className="accent-primary h-4 w-4 cursor-pointer"
          />
          <span className={timeframe === "all" ? "font-medium" : "text-muted-foreground"}>
            All time
          </span>
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="timeframe"
            value="month"
            checked={timeframe === "month"}
            onChange={() => setTimeframe("month")}
            className="accent-primary h-4 w-4 cursor-pointer"
          />
          <span className={timeframe === "month" ? "font-medium" : "text-muted-foreground"}>
            This month
          </span>
        </label>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5 lg:grid-cols-7">
        {STAGES.map((s) => {
          const isApplied = s.key === "applied";
          // Base counts
          let allVal = isApplied ? totalAll : counts.all[s.key] || 0;
          let monthVal = isApplied ? totalMonth : counts.month[s.key] || 0;

          // Aggregation rules:
          // HR CALL = hr_call + interview + offer + rejected
          // INTERVIEW = interview + offer
          if (s.key === "hr_call") {
            allVal =
              (counts.all.hr_call || 0) +
              (counts.all.interview || 0) +
              (counts.all.offer || 0) +
              (counts.all.rejected || 0);
            monthVal =
              (counts.month.hr_call || 0) +
              (counts.month.interview || 0) +
              (counts.month.offer || 0) +
              (counts.month.rejected || 0);
          } else if (s.key === "interview") {
            allVal = (counts.all.interview || 0) + (counts.all.offer || 0);
            monthVal = (counts.month.interview || 0) + (counts.month.offer || 0);
          }
          const showPct = !isApplied;
          const allPct = showPct ? pct(allVal, totalAll) : undefined;
          const monthPct = showPct ? pct(monthVal, totalMonth) : undefined;

          const activeVal = timeframe === "all" ? allVal : monthVal;
          const activePct = timeframe === "all" ? allPct : monthPct;

          return (
            <Card key={s.key} className="border-border bg-card/60 border p-3 backdrop-blur">
              <div className="text-muted-foreground text-xs tracking-wide uppercase">{s.label}</div>
              <div className="flex items-end justify-between gap-2">
                <div className="text-2xl leading-tight font-semibold">
                  {activeVal}
                  {showPct && (
                    <span className="text-muted-foreground ml-2 text-xs">{activePct}%</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
