"use client";

import type { ChartData } from "@/lib/zwds-core";
import { STEM_NAMES, BRANCH_NAMES } from "@/lib/zwds-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FourPillarsDisplayProps {
  chartData: ChartData;
}

export function FourPillarsDisplay({ chartData }: FourPillarsDisplayProps) {
  const { fourPillars } = chartData;
  const pillars = [
    { label: "Year", ...fourPillars.year },
    { label: "Month", ...fourPillars.month },
    { label: "Day", ...fourPillars.day },
    { label: "Hour", ...fourPillars.hour },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Four Pillars (四柱八字)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 text-center">
          {pillars.map((p) => (
            <div key={p.label} className="space-y-1">
              <div className="text-[10px] text-muted-foreground">{p.label}</div>
              <div className="text-lg font-semibold leading-tight">
                {STEM_NAMES[p.stem].zh}{BRANCH_NAMES[p.branch].zh}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                {p.stem} {BRANCH_NAMES[p.branch].animal}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
