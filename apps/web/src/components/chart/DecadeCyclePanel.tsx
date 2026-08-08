"use client";

import type { ChartData } from "@/lib/zwds-core";
import { PALACE_BY_ID } from "@/lib/zwds-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DecadeCyclePanelProps {
  chartData: ChartData;
}

export function DecadeCyclePanel({ chartData }: DecadeCyclePanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Decade Cycles (大限)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {chartData.decadeCycles.map((cycle, i) => {
            const palace = chartData.palaces[cycle.palaceIndex];
            const def = PALACE_BY_ID[palace?.name];
            const isActive = i <= 5; // first 5 decades are generally more relevant

            return (
              <div
                key={i}
                className={`flex items-center justify-between p-1.5 rounded text-xs ${
                  isActive ? "bg-muted/50" : "text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium w-16 text-right">
                    {cycle.startAge}–{cycle.endAge}
                  </span>
                  <span>
                    {def?.shortNameEn ?? palace?.name}
                    {palace?.isMingPalace ? " ★" : ""}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {cycle.direction === "clockwise" ? "↻" : "↺"}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
