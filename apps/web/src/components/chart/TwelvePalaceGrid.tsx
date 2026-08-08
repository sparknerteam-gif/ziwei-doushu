"use client";

import type { ChartData } from "@/lib/zwds-core";
import { PALACE_BY_ID, BRIGHTNESS_COLORS, BRIGHTNESS_LABELS, STEM_NAMES, BRANCH_NAMES } from "@/lib/zwds-core";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Palace, Star } from "@/lib/zwds-core";

interface TwelvePalaceGridProps {
  chartData: ChartData;
}

/** Grid layout — traditional arrangement: 巳午未申 top, 辰-酉 mid, 卯-戌 mid, 寅丑子亥 bottom */
const GRID_LAYOUT: Record<number, { row: number; col: number }> = {
  5: { row: 1, col: 1 },  // 巳 → Friends
  6: { row: 1, col: 2 },  // 午 → Career
  7: { row: 1, col: 3 },  // 未 → Property
  8: { row: 1, col: 4 },  // 申 → Fortune
  4: { row: 2, col: 1 },  // 辰 → Travel
  9: { row: 2, col: 4 },  // 酉 → Parents
  3: { row: 3, col: 1 },  // 卯 → Health
  10: { row: 3, col: 4 }, // 戌 → Destiny
  2: { row: 4, col: 1 },  // 寅 → Wealth
  1: { row: 4, col: 2 },  // 丑 → Children
  0: { row: 4, col: 3 },  // 子 → Spouse
  11: { row: 4, col: 4 }, // 亥 → Siblings
};

export function TwelvePalaceGrid({ chartData }: TwelvePalaceGridProps) {
  // Map palaces by branch index
  const palaceByBranch: Record<number, Palace> = {};
  for (const p of chartData.palaces) {
    palaceByBranch[p.index] = p;
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-3">12-Palace Birth Chart</h2>

      {/* Desktop: Traditional 4x4 Grid */}
      <div
        className="hidden md:grid gap-1 w-full"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(4, 1fr)",
          aspectRatio: "1 / 1",
          maxWidth: "640px",
          minWidth: "400px",
        }}
      >
        {/* Palace cells in branch order 0-11 */}
        {Array.from({ length: 12 }, (_, branchIdx) => {
          const layout = GRID_LAYOUT[branchIdx];
          const palace = palaceByBranch[branchIdx];
          if (!palace) return null;

          return (
            <PalaceCell
              key={branchIdx}
              palace={palace}
              isCenter={false}
              style={{
                gridRow: layout.row,
                gridColumn: layout.col,
              }}
            />
          );
        })}

        {/* Center area — chart metadata */}
        <div
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted/30 text-center min-h-0"
          style={{ gridRow: "2 / 4", gridColumn: "2 / 4" }}
        >
          <div className="text-xs font-semibold leading-tight">
            {STEM_NAMES[chartData.lunarDate.yearStem].zh}
            {BRANCH_NAMES[chartData.lunarDate.yearBranch].zh}
            {" "}Year
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
            {chartData.fiveElementBureau.element.charAt(0).toUpperCase() + chartData.fiveElementBureau.element.slice(1)}
            {" "}· Bureau {chartData.fiveElementBureau.number}
          </div>
          <div className="text-[10px] text-muted-foreground leading-tight">
            {chartData.lunarDate.yearStem}{chartData.lunarDate.yearBranch}
            {" · "}
            {chartData.lunarDate.monthStem}{chartData.lunarDate.monthBranch}
          </div>
          <div className="mt-2 text-[28px] opacity-20">✦</div>
        </div>
      </div>

      {/* Mobile: 2-column card list */}
      <div className="md:hidden grid grid-cols-2 gap-2">
        {chartData.palaces.map((palace) => {
          const def = PALACE_BY_ID[palace.name];
          return (
            <div
              key={palace.index}
              className={`rounded-lg border bg-card p-2 text-center text-sm ${
                palace.isMingPalace ? "ring-2 ring-primary/60" : ""
              } ${palace.isShenPalace ? "ring-1 ring-amber-500/60" : ""}`}
            >
              <div className="text-[10px] text-muted-foreground font-mono">
                {STEM_NAMES[palace.heavenlyStem].zh}{BRANCH_NAMES[palace.earthlyBranch].zh}
              </div>
              <div className="font-semibold text-xs mt-0.5">
                {def?.shortNameEn ?? palace.name}
                {palace.isMingPalace && " ★"}
                {palace.isShenPalace && " ☆"}
              </div>
              <div className="text-[10px] text-muted-foreground">{def?.nameZh}</div>
              <div className="mt-1 text-[10px] leading-tight">
                {palace.stars.length > 0
                  ? palace.stars.slice(0, 4).map(s => s.nameEn.split(" / ")[0]).join(", ")
                  : "—"}
                {palace.stars.length > 4 && ` +${palace.stars.length - 4}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface PalaceCellProps {
  palace: Palace;
  isCenter: boolean;
  style: React.CSSProperties;
}

function PalaceCell({ palace, style }: PalaceCellProps) {
  const def = PALACE_BY_ID[palace.name];
  const palaceName = def?.shortNameEn ?? palace.name;
  const palaceZh = def?.nameZh ?? "";

  return (
    <Tooltip>
      <TooltipTrigger className="cursor-default">
        <div
          className={`relative rounded-lg border bg-card p-1.5 transition-colors hover:border-primary/50 overflow-hidden text-center ${
            palace.isMingPalace ? "ring-2 ring-primary/60" : ""
          } ${palace.isShenPalace ? "ring-1 ring-amber-500/60" : ""}`}
          style={style}
        >
          {/* Stem + Branch at top */}
          <div className="text-[9px] text-muted-foreground font-mono leading-tight">
            {STEM_NAMES[palace.heavenlyStem].zh}{BRANCH_NAMES[palace.earthlyBranch].zh}
            {" "}{palace.heavenlyStem}{palace.earthlyBranch}
          </div>

          {/* Palace name */}
          <div className="text-[11px] font-semibold leading-tight mt-0.5">
            {palaceName}
          </div>
          <div className="text-[9px] text-muted-foreground leading-tight">
            {palaceZh}
          </div>

          {/* Ming/Shen badges */}
          <div className="flex justify-center gap-0.5 mt-0.5">
            {palace.isMingPalace && (
              <span className="text-[8px] px-1 rounded bg-primary/10 text-primary font-medium">M</span>
            )}
            {palace.isShenPalace && (
              <span className="text-[8px] px-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">S</span>
            )}
          </div>

          {/* Stars */}
          <div className="mt-1 space-y-0">
            {palace.majorStars.length > 0 && (
              <div className="flex flex-wrap justify-center gap-0.5">
                {palace.majorStars.map((star) => (
                  <StarBadge key={star.id} star={star} />
                ))}
              </div>
            )}
            {palace.minorStars.length > 0 && (
              <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                {palace.minorStars.slice(0, 6).map((star) => (
                  <StarBadge key={star.id} star={star} small />
                ))}
                {palace.minorStars.length > 6 && (
                  <span className="text-[8px] text-muted-foreground">
                    +{palace.minorStars.length - 6}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Decade cycle indicator */}
          {palace.decadeCycle && (
            <div className="mt-1 text-[8px] text-muted-foreground">
              Ages {palace.decadeCycle.startAge}–{palace.decadeCycle.endAge}
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px] p-3">
        <div className="font-semibold text-sm">
          {palaceName} ({palaceZh})
          {palace.isMingPalace && " ★ Destiny Palace"}
          {palace.isShenPalace && " ☆ Body Palace"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {STEM_NAMES[palace.heavenlyStem].zh}{BRANCH_NAMES[palace.earthlyBranch].zh}
          {" "}
          {palace.heavenlyStem}{palace.earthlyBranch}
        </div>
        {palace.majorStars.length > 0 && (
          <div className="mt-2 text-xs">
            <span className="font-medium">Major:</span>{" "}
            {palace.majorStars.map(s => {
              const b = BRIGHTNESS_LABELS[s.brightness];
              return `${s.nameEn} (${b?.en ?? s.brightness})${s.transformation ? ` [${s.transformation}]` : ""}`;
            }).join(", ")}
          </div>
        )}
        {palace.minorStars.length > 0 && (
          <div className="mt-1 text-xs">
            <span className="font-medium">Minor:</span>{" "}
            {palace.minorStars.map(s => s.nameEn).join(", ")}
          </div>
        )}
        {palace.decadeCycle && (
          <div className="mt-1 text-xs text-muted-foreground">
            Decade Cycle: Ages {palace.decadeCycle.startAge}–{palace.decadeCycle.endAge}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function StarBadge({ star, small }: { star: Star; small?: boolean }) {
  const color = BRIGHTNESS_COLORS[star.brightness] ?? "#6b7280";
  const transSymbol: Record<string, string> = {
    lu: "祿", quan: "權", ke: "科", ji: "忌",
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1 py-0 rounded text-[9px] font-medium ${
        small ? "text-[8px]" : ""
      }`}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}40`,
      }}
      title={`${star.nameEn} (${star.nameZh}) · ${BRIGHTNESS_LABELS[star.brightness]?.en ?? star.brightness}${star.transformation ? ` · ${star.transformation.toUpperCase()}` : ""}`}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {star.transformation && (
        <span className="font-bold text-[10px] leading-none">
          {transSymbol[star.transformation]}
        </span>
      )}
      {star.nameEn.split(" / ")[0]}
    </span>
  );
}
