"use client";

import type { ChartData } from "@/lib/zwds-core";
import { TRANSFORMATION_NAMES, PALACE_BY_ID } from "@/lib/zwds-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TransformationListProps {
  chartData: ChartData;
}

const TRANS_COLORS: Record<string, string> = {
  lu: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
  quan: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
  ke: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
  ji: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
};

const TRANS_SYMBOLS: Record<string, string> = {
  lu: "祿",
  quan: "權",
  ke: "科",
  ji: "忌",
};

export function TransformationList({ chartData }: TransformationListProps) {
  if (chartData.transformations.length === 0) {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground text-center">
          No transformation data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Four Transformations (四化)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {chartData.transformations.map((t, i) => {
          const palace = chartData.palaces[t.palaceIndex];
          const palaceDef = PALACE_BY_ID[palace.name];
          const transName = TRANSFORMATION_NAMES[t.type];

          return (
            <div
              key={i}
              className={`flex items-center justify-between p-2 rounded-md border ${TRANS_COLORS[t.type]}`}
            >
              <div>
                <div className="text-xs font-semibold">
                  {t.starNameEn}
                  <span className="text-muted-foreground ml-1">({t.starNameZh})</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  in {palaceDef?.shortNameEn ?? palace.name} Palace
                  {" "}({palaceDef?.nameZh})
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {TRANS_SYMBOLS[t.type]} {transName?.en ?? t.type}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
