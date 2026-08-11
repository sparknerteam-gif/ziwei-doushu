"use client";

import { useState } from "react";
import { calculateChartSync } from "@/lib/kismet-core";
import type { ChartData, BirthData, HeavenlyStem, EarthlyBranch } from "@/lib/kismet-core";
import {
  STEM_NAMES,
  BRANCH_NAMES,
  getShichen,
} from "@/lib/kismet-core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── 12 Shichen ──
const SHICHEN_HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
const SHICHEN_NAMES = ["子時 (23-01)", "丑時 (01-03)", "寅時 (03-05)", "卯時 (05-07)", "辰時 (07-09)", "巳時 (09-11)", "午時 (11-13)", "未時 (13-15)", "申時 (15-17)", "酉時 (17-19)", "戌時 (19-21)", "亥時 (21-23)"];

// ── Prompt builders ──

function buildSingleChartPrompt(chart: ChartData, birthData: BirthData): string {
  const lines: string[] = [];
  lines.push("You are Kismet, a 紫微斗數 (Ziwei Doushu) life script interpreter.");
  lines.push("");
  lines.push("Below is a COMPUTED birth chart. The math has been done by the Kismet calculation engine — Four Pillars, Palace locations, star placements, and transformations are all verified. Your job is to INTERPRET, not recalculate.");
  lines.push("");
  lines.push("---");
  lines.push("");
  addBirthData(lines, birthData);
  addChartData(lines, chart, birthData);
  addInterpretationTask(lines);
  return lines.join("\n");
}

function buildCalibrationPrompt(
  charts: ChartData[],
  birthData: BirthData,
  lifeEvent: string
): string {
  const lines: string[] = [];
  lines.push("You are Kismet, a 紫微斗數 (Ziwei Doushu) life script decoder specializing in birth time calibration.");
  lines.push("");
  lines.push("## The Situation");
  lines.push("This person does NOT know their birth time. I have computed ALL 12 possible birth charts (one for each 時辰 / 2-hour period). Your job is to:");
  lines.push("");
  lines.push("1. Read the life event below");
  lines.push("2. Compare it against each of the 12 charts");
  lines.push("3. Identify which chart BEST matches the life event");
  lines.push("4. Deliver the full reading using that chart");
  lines.push("");
  lines.push("---");
  lines.push("");
  addBirthData(lines, birthData);
  lines.push("");

  lines.push("## Life Event (Calibration Anchor)");
  lines.push(lifeEvent);
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("## The 12 Possible Charts");
  lines.push("");
  lines.push("For each shichen, I show: Ming Palace stars + Current Decade Cycle + Health Palace stars. Use these to find which chart's patterns match the life event.");
  lines.push("");

  for (let i = 0; i < charts.length; i++) {
    const chart = charts[i];
    const mingPalace = chart.palaces.find(p => p.isMingPalace) || chart.palaces[chart.mingPalaceIndex];
    const healthPalace = chart.palaces.find(p => p.name === "jie"); // 疾厄宮
    const currentDecade = getCurrentDecade(chart, birthData);

    lines.push(`### ${SHICHEN_NAMES[i]}`);
    lines.push(`- Ming Palace: ${mingPalace.stars.map(s => s.nameEn).join(", ") || "(empty)"}`);
    lines.push(`- Four Pillars: ${STEM_NAMES[chart.fourPillars.year.stem].en}${BRANCH_NAMES[chart.fourPillars.year.branch].en} ${STEM_NAMES[chart.fourPillars.month.stem].en}${BRANCH_NAMES[chart.fourPillars.month.branch].en} ${STEM_NAMES[chart.fourPillars.day.stem].en}${BRANCH_NAMES[chart.fourPillars.day.branch].en} ${STEM_NAMES[chart.fourPillars.hour.stem].en}${BRANCH_NAMES[chart.fourPillars.hour.branch].en}`);
    if (currentDecade) {
      const dPalace = chart.palaces[currentDecade.palaceIndex];
      lines.push(`- Current Decade: Age ${currentDecade.startAge}-${currentDecade.endAge}, ${dPalace?.name || ""} palace`);
    }
    if (healthPalace) {
      lines.push(`- Health Palace: ${healthPalace.stars.map(s => s.nameEn).join(", ") || "(empty)"}`);
    }
    if (chart.transformations?.length > 0) {
      const tNames = chart.transformations.map(t => {
        const star = chart.palaces.flatMap(p => p.stars).find(s => s.id === t.starId);
        return `${t.type}:${star?.nameEn || t.starId}`;
      }).join(" ");
      lines.push(`- Transformations: ${tNames}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## Your Calibration Process");
  lines.push("");
  lines.push("Step 1: Read the life event carefully. Note: what happened, when, what body/life area was affected.");
  lines.push("");
  lines.push("Step 2: For each chart above, check:");
  lines.push("- Does the Health Palace (疾厄宮) show stress signals matching the event?");
  lines.push("- Does the current Decade Cycle's palace and stars align with the event timing?");
  lines.push("- Do the Four Pillars' day/hour stems conflict or harmonize with the event year?");
  lines.push("- Do transformations (especially 化忌) point to the affected life area?");
  lines.push("");
  lines.push("Step 3: Rank the top 3 matching charts. Explain WHY each matches or doesn't match.");
  lines.push("");
  lines.push("Step 4: Select the BEST match. This is the calibrated birth time.");
  lines.push("");
  lines.push("Step 5: Deliver the full reading for the selected chart:");
  lines.push("- Core personality (from Ming Palace stars)");
  lines.push("- Career and wealth direction");
  lines.push("- Relationship dynamics");
  lines.push("- How the life event is explained by the chart");
  lines.push("- Current decade cycle themes");
  lines.push("- One insight for the next 1-2 years");
  lines.push("");
  lines.push("## Rules");
  lines.push("- Be precise. Quote which shichen you selected and why.");
  lines.push("- If multiple charts could match, explain your reasoning for the final pick.");
  lines.push("- Use professional star names (e.g., The Emperor, The Chancellor, The Warrior).");
  lines.push("- Never predict death, illness, or tragedy.");
  lines.push("- End with: 'This is a pattern analysis for self-reflection, not deterministic prophecy.'");

  return lines.join("\n");
}

function addBirthData(lines: string[], bd: BirthData) {
  lines.push("## Birth Data");
  lines.push(`- Date: ${bd.year}-${String(bd.month).padStart(2, "0")}-${String(bd.day).padStart(2, "0")}`);
  lines.push(`- Time: ${String(bd.hour).padStart(2, "0")}:${String(bd.minute).padStart(2, "0")}`);
  lines.push(`- Timezone: ${bd.ianaTimeZone}`);
  lines.push(`- Gender: ${bd.gender}`);
}

function addChartData(lines: string[], chart: ChartData, bd: BirthData) {
  lines.push("");
  lines.push("## Four Pillars (四柱)");
  lines.push(`- Year: ${STEM_NAMES[chart.fourPillars.year.stem].en} ${BRANCH_NAMES[chart.fourPillars.year.branch].en}`);
  lines.push(`- Month: ${STEM_NAMES[chart.fourPillars.month.stem].en} ${BRANCH_NAMES[chart.fourPillars.month.branch].en}`);
  lines.push(`- Day: ${STEM_NAMES[chart.fourPillars.day.stem].en} ${BRANCH_NAMES[chart.fourPillars.day.branch].en}`);
  lines.push(`- Hour: ${STEM_NAMES[chart.fourPillars.hour.stem].en} ${BRANCH_NAMES[chart.fourPillars.hour.branch].en}`);
  lines.push("");
  lines.push("## Ming Palace (命宮)");
  const mingPalace = chart.palaces.find(p => p.isMingPalace) || chart.palaces[chart.mingPalaceIndex];
  lines.push(`- Location: ${mingPalace.name} (${BRANCH_NAMES[mingPalace.earthlyBranch].en})`);
  lines.push(`- Stars: ${mingPalace.stars.map(s => s.nameEn).join(", ")}`);
  lines.push("");
  lines.push("## All 12 Palaces");
  for (const palace of chart.palaces) {
    const starNames = palace.stars.length > 0 ? palace.stars.map(s => s.nameEn).join(", ") : "(empty)";
    lines.push(`- ${palace.name} (${BRANCH_NAMES[palace.earthlyBranch].en}): ${starNames}`);
  }
  lines.push("");
  lines.push("## Transformations (四化)");
  if (chart.transformations?.length > 0) {
    for (const t of chart.transformations) {
      const star = chart.palaces.flatMap(p => p.stars).find(s => s.id === t.starId);
      lines.push(`- ${t.type}: ${star?.nameEn || t.starId}`);
    }
  } else {
    lines.push("(none)");
  }
  const decade = getCurrentDecade(chart, bd);
  if (decade) {
    const dp = chart.palaces[decade.palaceIndex];
    lines.push("");
    lines.push("## Current Decade Cycle");
    lines.push(`- Age ${decade.startAge}-${decade.endAge} — ${dp?.name || ""} palace`);
  }
}

function addInterpretationTask(lines: string[]) {
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Your Task");
  lines.push("");
  lines.push("Interpret this chart as a life script reading. Output in TWO parts:");
  lines.push("");
  lines.push("### Part A: Chart Summary");
  lines.push("- Restate the Four Pillars and Ming Palace");
  lines.push("- Highlight the 2-3 most important stars");
  lines.push("");
  lines.push("### Part B: Life Script Reading");
  lines.push("- Core personality and talents (from Ming Palace)");
  lines.push("- Career and wealth direction");
  lines.push("- Relationship patterns");
  lines.push("- Current decade cycle themes");
  lines.push("- One insight for the next 1-2 years");
  lines.push("");
  lines.push("## Rules");
  lines.push("- Be specific. No vague horoscope language.");
  lines.push("- Use professional star archetypes (The Emperor, The Chancellor, The Warrior, etc.)");
  lines.push("- Tone: analytical and warm, like a systems diagnosis.");
  lines.push("- End with: 'This is a pattern analysis for self-reflection, not deterministic prophecy.'");
  lines.push("");
  lines.push("The chart data is computed by an engine. Trust the math. Interpret the story.");
}

function getCurrentDecade(chart: ChartData, bd: BirthData) {
  if (!chart.decadeCycles?.length) return null;
  const age = new Date().getFullYear() - bd.year;
  return chart.decadeCycles.find(d => d.startAge <= age && d.endAge >= age) || null;
}

// ── Page Component ──

export default function ReadingPage() {
  const [mode, setMode] = useState<"known" | "unknown">("known");
  const [year, setYear] = useState("2003");
  const [month, setMonth] = useState("7");
  const [day, setDay] = useState("11");
  const [hour, setHour] = useState("22");
  const [minute, setMinute] = useState("0");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [timezone, setTimezone] = useState("Asia/Hong_Kong");
  const [longitude, setLongitude] = useState("114.169");
  const [lifeEvent, setLifeEvent] = useState("");
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCompute = () => {
    setLoading(true);
    setError("");
    setPromptText("");

    try {
      const baseData = {
        gender: gender as "male" | "female",
        ianaTimeZone: timezone,
        longitude: parseFloat(longitude),
      };

      if (mode === "known") {
        // Single chart
        const bd: BirthData = {
          ...baseData,
          year: parseInt(year),
          month: parseInt(month),
          day: parseInt(day),
          hour: parseInt(hour),
          minute: parseInt(minute),
        };
        const chart = calculateChartSync(bd);
        setPromptText(buildSingleChartPrompt(chart, bd));
      } else {
        // All 12 shichen for calibration
        if (!lifeEvent.trim()) {
          setError("Please enter a life event for calibration when birth time is unknown.");
          setLoading(false);
          return;
        }
        const charts: ChartData[] = [];
        const birthDay = parseInt(day);
        for (const h of SHICHEN_HOURS) {
          const bd: BirthData = {
            ...baseData,
            year: parseInt(year),
            month: parseInt(month),
            day: birthDay,
            hour: h,
            minute: 0,
          };
          charts.push(calculateChartSync(bd));
        }
        const bd: BirthData = {
          ...baseData,
          year: parseInt(year),
          month: parseInt(month),
          day: birthDay,
          hour: 0,
          minute: 0,
        };
        setPromptText(buildCalibrationPrompt(charts, bd, lifeEvent));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed. Check your inputs.");
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls = "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 outline-none";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">✦ Kismet — Private Reading</h1>
          <Badge variant="secondary" className="text-xs">Engine-Computed</Badge>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-2">
          <p><strong>🔒 100% Private.</strong> Your chart is computed in your browser. No data is stored or sent anywhere.</p>
          <ol className="space-y-1 text-muted-foreground">
            <li>1. Enter birth data → engine computes your chart</li>
            <li>2. Copy the generated prompt → paste into <strong>Claude</strong> (claude.ai)</li>
            <li>3. Claude interprets your chart and delivers your reading</li>
          </ol>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("known")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "known" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            I know my birth time
          </button>
          <button
            onClick={() => setMode("unknown")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "unknown" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            I DON'T know my birth time
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Year</Label>
              <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="2003" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label>Month</Label>
              <input type="number" value={month} onChange={e => setMonth(e.target.value)} placeholder="7" min="1" max="12" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label>Day</Label>
              <input type="number" value={day} onChange={e => setDay(e.target.value)} placeholder="11" min="1" max="31" className={inputCls} />
            </div>
          </div>

          {mode === "known" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Hour (0-23)</Label>
                <input type="number" value={hour} onChange={e => setHour(e.target.value)} placeholder="22" min="0" max="23" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <Label>Minute</Label>
                <input type="number" value={minute} onChange={e => setMinute(e.target.value)} placeholder="0" min="0" max="59" className={inputCls} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <select value={gender} onChange={e => setGender(e.target.value as "male" | "female")} className={inputCls}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <input type="text" value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="Asia/Hong_Kong" className={inputCls} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>City Longitude</Label>
            <input type="text" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="114.169" className={inputCls} />
            <p className="text-xs text-muted-foreground">Used for True Solar Time correction. Find at <a href="https://www.latlong.net/" target="_blank" rel="noopener" className="underline">latlong.net</a></p>
          </div>

          {mode === "unknown" && (
            <div className="space-y-1.5">
              <Label>Your Major Life Event (Calibration Anchor) *</Label>
              <textarea
                value={lifeEvent}
                onChange={e => setLifeEvent(e.target.value)}
                rows={4}
                placeholder="Tell me about ONE major life event — what happened, when it happened (year/month), and how it changed you. Be specific. This is how we find your correct birth time.&#10;&#10;Example: 'I was hospitalized for 7 days in May 2026 due to EBV infection. It forced me to stop working and rethink my entire life direction.'"
                className={`${inputCls} resize-y min-h-[100px]`}
              />
              <p className="text-xs text-muted-foreground">The more specific you are, the more accurate the calibration. This is the KEY to finding your correct birth chart.</p>
            </div>
          )}

          <Button onClick={handleCompute} disabled={loading} className="w-full" size="lg">
            {loading ? "Computing..." : mode === "known" ? "Compute My Chart" : "Compute All 12 Charts + Calibrate"}
          </Button>

          {error && (
            <div className="border border-destructive/50 bg-destructive/5 rounded-lg p-3 text-destructive text-sm">{error}</div>
          )}
        </div>

        {/* Output */}
        {promptText && (
          <div className="space-y-3">
            <h3 className="font-semibold">
              {mode === "known" ? "🤖 Your Interpretation Prompt" : "🔬 Your Calibration + Interpretation Prompt"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {mode === "known"
                ? "Paste this into Claude. The chart data is engine-computed — Claude only interprets."
                : "12 charts computed. Claude will compare them against your life event to find the correct one."}
            </p>
            <pre className="bg-card border rounded-lg p-4 text-xs leading-relaxed overflow-auto max-h-96 whitespace-pre-wrap select-all">
              {promptText}
            </pre>
            <button
              onClick={handleCopy}
              className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                copied ? "bg-primary text-primary-foreground" : "bg-foreground text-background hover:opacity-90"
              }`}
            >
              {copied ? "✓ Copied! Now paste into Claude" : "📋 Copy Prompt"}
            </button>
          </div>
        )}

        <footer className="border-t pt-4 text-center text-xs text-muted-foreground">
          Kismet — Life Script Decoder. For guidance and self-reflection only.
        </footer>
      </main>
    </div>
  );
}
