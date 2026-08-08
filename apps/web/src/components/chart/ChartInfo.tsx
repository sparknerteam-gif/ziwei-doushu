"use client";

import type { ChartData } from "@/lib/zwds-core";
import { STEM_NAMES, BRANCH_NAMES, FIVE_ELEMENT_NAMES, COMMON_TERMS } from "@/lib/zwds-core";
import { Card, CardContent } from "@/components/ui/card";

interface ChartInfoProps {
  chartData: ChartData;
}

export function ChartInfo({ chartData }: ChartInfoProps) {
  const { lunarDate, fourPillars, fiveElementBureau } = chartData;

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Birth:</span>
        <span className="font-medium">
          {chartData.birthData.year}-{String(chartData.birthData.month).padStart(2, "0")}-{String(chartData.birthData.day).padStart(2, "0")}
          {" "}{String(chartData.birthData.hour).padStart(2, "0")}:{String(chartData.birthData.minute).padStart(2, "0")}
        </span>
      </div>

      <span className="text-muted-foreground">→</span>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Lunar:</span>
        <span className="font-medium">
          {lunarDate.year}-{lunarDate.month}-{lunarDate.day}
          {lunarDate.isLeapMonth && " (leap)"}
        </span>
      </div>

      <span className="text-muted-foreground">·</span>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Year Pillar:</span>
        <span className="font-medium">
          {STEM_NAMES[fourPillars.year.stem].zh}{BRANCH_NAMES[fourPillars.year.branch].zh}
          {" "}({fourPillars.year.stem} {BRANCH_NAMES[fourPillars.year.branch].animal})
        </span>
      </div>

      <span className="text-muted-foreground">·</span>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Bureau:</span>
        <span className="font-medium">
          {FIVE_ELEMENT_NAMES[fiveElementBureau.element].en} {fiveElementBureau.number}
        </span>
      </div>

      <span className="text-muted-foreground">·</span>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Gender:</span>
        <span className="font-medium capitalize">{chartData.birthData.gender}</span>
      </div>
    </div>
  );
}
