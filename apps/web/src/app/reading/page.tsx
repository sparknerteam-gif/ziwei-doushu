"use client";

import { useState } from "react";
import { calculateChartSync } from "@/lib/kismet-core";
import type { ChartData, BirthData } from "@/lib/kismet-core";
import {
  STEM_NAMES,
  BRANCH_NAMES,
  INDEX_TO_BRANCH,
} from "@/lib/kismet-core";
import { BirthDataForm } from "@/components/forms/BirthDataForm";
import { Badge } from "@/components/ui/badge";

function buildInterpretationPrompt(chart: ChartData, birthData: BirthData): string {
  const lines: string[] = [];

  lines.push("You are Kismet, a 紫微斗數 (Ziwei Doushu) life script interpreter.");
  lines.push("");
  lines.push("Below is a COMPUTED birth chart. The math has already been done by the Kismet calculation engine — the Four Pillars, Palace locations, star placements, and transformations are all verified and correct. Your job is to INTERPRET the chart, not recalculate it.");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Birth Data");
  lines.push(`- Date: ${birthData.year}-${String(birthData.month).padStart(2, "0")}-${String(birthData.day).padStart(2, "0")}`);
  lines.push(`- Time: ${String(birthData.hour).padStart(2, "0")}:${String(birthData.minute).padStart(2, "0")}`);
  lines.push(`- Timezone: ${birthData.ianaTimeZone}`);
  lines.push(`- Gender: ${birthData.gender}`);
  lines.push("");
  lines.push("## Four Pillars (四柱)");
  lines.push(`- Year: ${STEM_NAMES[chart.fourPillars.year.stem].en} ${BRANCH_NAMES[chart.fourPillars.year.branch].en}`);
  lines.push(`- Month: ${STEM_NAMES[chart.fourPillars.month.stem].en} ${BRANCH_NAMES[chart.fourPillars.month.branch].en}`);
  lines.push(`- Day: ${STEM_NAMES[chart.fourPillars.day.stem].en} ${BRANCH_NAMES[chart.fourPillars.day.branch].en}`);
  lines.push(`- Hour: ${STEM_NAMES[chart.fourPillars.hour.stem].en} ${BRANCH_NAMES[chart.fourPillars.hour.branch].en}`);
  lines.push("");

  lines.push("## Ming Palace (命宮)");
  const mingPalace = chart.palaces.find(p => p.isMingPalace) || chart.palaces[chart.mingPalaceIndex];
  lines.push(`- Location: ${mingPalace.name} (Earthly Branch: ${BRANCH_NAMES[mingPalace.earthlyBranch].en})`);
  lines.push(`- Stars: ${mingPalace.stars.map(s => s.nameEn).join(", ")}`);
  lines.push("");

  lines.push("## All 12 Palaces with Stars");
  for (const palace of chart.palaces) {
    const starNames = palace.stars.length > 0
      ? palace.stars.map(s => s.nameEn).join(", ")
      : "(empty)";
    lines.push(`- ${palace.name} (${BRANCH_NAMES[palace.earthlyBranch].en}): ${starNames}`);
  }
  lines.push("");

  lines.push("## Transformations (四化)");
  if (chart.transformations && chart.transformations.length > 0) {
    for (const t of chart.transformations) {
      const star = chart.palaces.flatMap(p => p.stars).find(s => s.id === t.starId);
      lines.push(`- ${t.type}: ${star?.nameEn || t.starId}`);
    }
  } else {
    lines.push("(none)");
  }
  lines.push("");

  lines.push("## Decade Cycles");
  if (chart.decadeCycles && chart.decadeCycles.length > 0) {
    const age = new Date().getFullYear() - birthData.year;
    const current = chart.decadeCycles.find(d => d.startAge <= age && d.endAge >= age);
    if (current) {
      const palaceName = chart.palaces[current.palaceIndex]?.name || "";
      lines.push(`- Current decade: Age ${current.startAge}-${current.endAge} — ${palaceName} palace`);
    }
  }
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("## Your Task");
  lines.push("");
  lines.push("Interpret this chart as a life script reading. Output in TWO parts:");
  lines.push("");
  lines.push("### Part A: Chart Summary (brief)");
  lines.push("- Restate the Four Pillars and Ming Palace in plain English");
  lines.push("- Highlight the most important 2-3 stars and what they mean");
  lines.push("- Note any rare or notable configurations");
  lines.push("");
  lines.push("### Part B: Life Script Reading");
  lines.push("- Core personality and natural talents (from Ming Palace and overall chart)");
  lines.push("- Career and wealth direction");
  lines.push("- Relationship and partnership patterns");
  lines.push("- Current decade cycle — themes and opportunities");
  lines.push("- One specific insight or warning for the next 1-2 years");
  lines.push("");
  lines.push("## Rules");
  lines.push("- Be specific and concrete. No vague horoscope language.");
  lines.push("- Use professional archetype names (e.g., The Emperor, The Chancellor, The Warrior).");
  lines.push("- If a star configuration is rare or intense, say so directly.");
  lines.push("- Keep the tone analytical and warm — like a systems diagnosis.");
  lines.push("- Never predict death, illness, or tragedy.");
  lines.push("- End with: 'This is a pattern analysis for self-reflection, not deterministic prophecy.'");
  lines.push("");
  lines.push("The chart data above is computed by an engine. Trust the math. Interpret the story.");

  return lines.join("\n");
}

export default function ReadingPage() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCalculate = (data: BirthData) => {
    setLoading(true);
    setError(null);
    setBirthData(data);
    try {
      const chart = calculateChartSync(data);
      setChartData(chart);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate chart");
      setChartData(null);
    }
    setLoading(false);
  };

  const promptText = chartData && birthData
    ? buildInterpretationPrompt(chartData, birthData)
    : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            ✦ Kismet — Private Reading
          </h1>
          <Badge variant="secondary" className="text-xs">
            Engine-Computed
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Intro */}
        <div className="bg-muted/30 rounded-lg p-5 space-y-3">
          <h2 className="font-semibold text-lg">🔒 Private. Accurate. Engine-Computed.</h2>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Enter your birth data below → chart is calculated by the <strong>Kismet engine</strong> (not AI guessing)</li>
            <li>2. Copy the generated prompt → paste into <strong>Claude</strong> (claude.ai)</li>
            <li>3. Claude interprets your chart and delivers your reading</li>
            <li>4. Your data stays between you and Claude. <strong>Nothing is saved.</strong></li>
          </ol>
        </div>

        {/* Birth Data Form */}
        <BirthDataForm onCalculate={handleCalculate} loading={loading} />

        {error && (
          <div className="border border-destructive/50 bg-destructive/5 rounded-lg p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full mb-3" />
            <p className="text-sm text-muted-foreground">Computing your chart with True Solar Time correction...</p>
          </div>
        )}

        {/* Chart Summary + Prompt */}
        {chartData && birthData && (
          <div className="space-y-6">
            {/* Quick Chart Summary */}
            <div className="border rounded-lg p-5 space-y-3">
              <h3 className="font-semibold">📊 Your Computed Chart</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Four Pillars</span>
                  <p className="font-medium">
                    {STEM_NAMES[chartData.fourPillars.year.stem].en}{BRANCH_NAMES[chartData.fourPillars.year.branch].en}{" "}
                    {STEM_NAMES[chartData.fourPillars.month.stem].en}{BRANCH_NAMES[chartData.fourPillars.month.branch].en}{" "}
                    {STEM_NAMES[chartData.fourPillars.day.stem].en}{BRANCH_NAMES[chartData.fourPillars.day.branch].en}{" "}
                    {STEM_NAMES[chartData.fourPillars.hour.stem].en}{BRANCH_NAMES[chartData.fourPillars.hour.branch].en}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ming Palace</span>
                  <p className="font-medium">
                    {chartData.palaces.find(p => p.isMingPalace)?.stars.map(s => s.nameEn).join(", ") || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Transformations</span>
                  <p className="font-medium">
                    {chartData.transformations?.length || 0} active
                  </p>
                </div>
              </div>
            </div>

            {/* Generated Prompt */}
            <div className="space-y-3">
              <h3 className="font-semibold">🤖 AI Interpretation Prompt</h3>
              <p className="text-sm text-muted-foreground">
                This prompt includes your <strong>computed chart data</strong>. Paste it into Claude
                — Claude will interpret, not calculate.
              </p>
              <pre className="bg-card border rounded-lg p-4 text-xs leading-relaxed overflow-auto max-h-80 whitespace-pre-wrap select-all">
                {promptText}
              </pre>
              <button
                onClick={handleCopy}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                  copied
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                {copied ? "✓ Copied! Now paste into Claude" : "📋 Copy Prompt"}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!chartData && !error && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-5xl mb-4">🔮</div>
            <p className="text-lg">Enter your birth data above.</p>
            <p className="text-sm mt-2">
              Your chart is calculated locally using the Kismet engine — no data is stored or sent anywhere.
            </p>
          </div>
        )}

        <footer className="border-t pt-4 text-center text-xs text-muted-foreground">
          Kismet — Life Script Decoder. For guidance and self-reflection only.
        </footer>
      </main>
    </div>
  );
}
