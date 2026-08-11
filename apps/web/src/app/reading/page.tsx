"use client";

import { useState } from "react";
import { calculateChartSync } from "@/lib/kismet-core";
import type { ChartData, BirthData } from "@/lib/kismet-core";
import {
  STEM_NAMES,
  BRANCH_NAMES,
} from "@/lib/kismet-core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ── Types ──

interface LifeEvent {
  what: string;    // What happened
  when: string;    // Year + month (e.g., "2026 May")
  cause: string;   // What triggered/caused it
  impact: string;  // How it changed you
}

// ── 12 Shichen ──

const SHICHEN_HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
const SHICHEN_NAMES = ["子時 (23-01)", "丑時 (01-03)", "寅時 (03-05)", "卯時 (05-07)", "辰時 (07-09)", "巳時 (09-11)", "午時 (11-13)", "未時 (13-15)", "申時 (15-17)", "酉時 (17-19)", "戌時 (19-21)", "亥時 (21-23)"];

// ── Prompt Builders ──

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
  events: LifeEvent[]
): string {
  const lines: string[] = [];

  lines.push("You are Kismet, a 紫微斗數 (Ziwei Doushu) life script decoder specializing in birth time reverse-calibration.");
  lines.push("");
  lines.push("## ⚠️ CRITICAL: This person does NOT know their birth time.");
  lines.push("");
  lines.push("I have computed ALL 12 possible birth charts (one for each 時辰).");
  lines.push("");
  lines.push("Below are **multiple life events** — each one is a calibration anchor. Your job:");
  lines.push("");
  lines.push("1. Compare EVERY event against EVERY chart");
  lines.push("2. Each event will point toward certain shichen and eliminate others");
  lines.push("3. Find the shichen that best explains ALL events simultaneously");
  lines.push("4. Deliver the full reading using the calibrated chart");
  lines.push("");
  lines.push("---");
  lines.push("");
  addBirthData(lines, birthData);
  lines.push("");

  // Events section
  lines.push("## 📋 Life Events (Calibration Anchors)");
  lines.push("");
  lines.push(`Total events provided: ${events.length}`);
  lines.push("");

  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    lines.push(`### Event ${i + 1}`);
    lines.push(`- **WHAT**: ${e.what}`);
    lines.push(`- **WHEN**: ${e.when}`);
    lines.push(`- **CAUSE**: ${e.cause}`);
    lines.push(`- **IMPACT**: ${e.impact}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## 🔬 The 12 Possible Charts");
  lines.push("");
  lines.push("For each shichen: Ming Palace stars, Four Pillars, Health Palace stars, current Decade Cycle, and Transformations.");
  lines.push("");

  for (let i = 0; i < charts.length; i++) {
    const chart = charts[i];
    const mingPalace = chart.palaces.find(p => p.isMingPalace) || chart.palaces[chart.mingPalaceIndex];
    const healthPalace = chart.palaces.find(p => p.name === "jie");
    const currentDecade = getCurrentDecade(chart, birthData);

    lines.push(`### ${SHICHEN_NAMES[i]}`);
    lines.push(`- Ming: ${mingPalace.stars.map(s => s.nameEn).join(", ") || "(empty)"}`);
    lines.push(`- Pillars: ${STEM_NAMES[chart.fourPillars.year.stem].en}${BRANCH_NAMES[chart.fourPillars.year.branch].en} ${STEM_NAMES[chart.fourPillars.month.stem].en}${BRANCH_NAMES[chart.fourPillars.month.branch].en} ${STEM_NAMES[chart.fourPillars.day.stem].en}${BRANCH_NAMES[chart.fourPillars.day.branch].en} ${STEM_NAMES[chart.fourPillars.hour.stem].en}${BRANCH_NAMES[chart.fourPillars.hour.branch].en}`);
    if (currentDecade) {
      const dp = chart.palaces[currentDecade.palaceIndex];
      lines.push(`- Decade: Age ${currentDecade.startAge}-${currentDecade.endAge}, ${dp?.name || ""}`);
    }
    if (healthPalace) {
      lines.push(`- Health: ${healthPalace.stars.map(s => s.nameEn).join(", ") || "(empty)"}`);
    }
    if (chart.transformations?.length > 0) {
      const tNames = chart.transformations.map(t => {
        const star = chart.palaces.flatMap(p => p.stars).find(s => s.id === t.starId);
        return `${t.type}:${star?.nameEn || t.starId}`;
      }).join(" ");
      lines.push(`- Transform: ${tNames}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## 🎯 Your Calibration Methodology");
  lines.push("");
  lines.push("### Phase 1: Event-by-Event Analysis");
  lines.push("");
  for (let i = 0; i < events.length; i++) {
    lines.push(`**Event ${i + 1}** ("${events[i].what.substring(0, 50)}..."):`);
    lines.push(`- What palace does this event primarily involve? (Health=疾厄, Career=事業, Relationships=夫妻, etc.)`);
    lines.push(`- What year did it happen? What was the 流年 (yearly) stem/branch at that time?`);
    lines.push(`- Which shichen charts show stress signals in the relevant palace during that period?`);
    lines.push(`- Which shichen are ELIMINATED by this event? (Be explicit — list the shichen numbers)`);
    lines.push("");
  }

  lines.push("### Phase 2: Cross-Reference & Scoring");
  lines.push("");
  lines.push("Create a score table. For each shichen, count how many events it explains:");
  lines.push("");
  lines.push("| Shichen | Event 1 | Event 2 | ... | Score |");
  lines.push("|---|---|---|---|---|");
  for (let i = 0; i < 12; i++) {
    lines.push(`| ${SHICHEN_NAMES[i]} | ✓/✗ | ✓/✗ | ... | 0/${events.length} |`);
  }
  lines.push("");
  lines.push("### Phase 3: Select & Justify");
  lines.push("");
  lines.push("- The calibrated shichen is the one with the HIGHEST score");
  lines.push("- If there's a tie, explain which events are more reliable anchors and why");
  lines.push("- State clearly: 'I select [shichen] as the calibrated birth time because...'");
  lines.push("");
  lines.push("### Phase 4: Full Reading");
  lines.push("");
  lines.push("Using the SELECTED chart, deliver:");
  lines.push("- Core personality (from Ming Palace stars)");
  lines.push("- Career & wealth direction");
  lines.push("- Relationship dynamics");
  lines.push("- How EACH life event is explained by this chart");
  lines.push("- Current decade cycle themes");
  lines.push("- One insight for the next 1-2 years");
  lines.push("");
  lines.push("## Rules");
  lines.push("- Be specific. Quote chart data. Show your reasoning.");
  lines.push("- If events contradict each other (point to different shichen), say so — this is valuable information.");
  lines.push("- Use professional star archetypes (The Emperor, The Chancellor, The Warrior, The Counselor, etc.)");
  lines.push("- Tone: analytical systems diagnosis. Not mystical fortune-telling.");
  lines.push("- Never predict death, illness, or tragedy.");
  lines.push("- End with: 'This is a pattern analysis for self-reflection, not deterministic prophecy.'");

  return lines.join("\n");
}

// ── Helpers ──

function addBirthData(lines: string[], bd: BirthData) {
  lines.push("## Birth Data");
  lines.push(`- Date: ${bd.year}-${String(bd.month).padStart(2, "0")}-${String(bd.day).padStart(2, "0")}`);
  if (bd.hour > 0 || bd.minute > 0) {
    lines.push(`- Time: ${String(bd.hour).padStart(2, "0")}:${String(bd.minute).padStart(2, "0")}`);
  } else {
    lines.push("- Time: UNKNOWN (calibration required)");
  }
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
  const mingPalace = chart.palaces.find(p => p.isMingPalace) || chart.palaces[chart.mingPalaceIndex];
  lines.push("## Ming Palace (命宮)");
  lines.push(`- ${mingPalace.name} (${BRANCH_NAMES[mingPalace.earthlyBranch].en}): ${mingPalace.stars.map(s => s.nameEn).join(", ")}`);
  lines.push("");
  lines.push("## All 12 Palaces");
  for (const palace of chart.palaces) {
    const sn = palace.stars.length > 0 ? palace.stars.map(s => s.nameEn).join(", ") : "(empty)";
    lines.push(`- ${palace.name} (${BRANCH_NAMES[palace.earthlyBranch].en}): ${sn}`);
  }
  lines.push("");
  lines.push("## Transformations (四化)");
  if (chart.transformations?.length > 0) {
    for (const t of chart.transformations) {
      const star = chart.palaces.flatMap(p => p.stars).find(s => s.id === t.starId);
      lines.push(`- ${t.type}: ${star?.nameEn || t.starId}`);
    }
  } else { lines.push("(none)"); }
  const decade = getCurrentDecade(chart, bd);
  if (decade) {
    const dp = chart.palaces[decade.palaceIndex];
    lines.push("");
    lines.push("## Current Decade Cycle");
    lines.push(`- Age ${decade.startAge}-${decade.endAge}: ${dp?.name || ""} palace`);
  }
}

function addInterpretationTask(lines: string[]) {
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Your Task");
  lines.push("");
  lines.push("Interpret this chart. Two parts:");
  lines.push("");
  lines.push("### Part A: Chart Summary — Four Pillars, Ming Palace, key stars");
  lines.push("### Part B: Life Script Reading — personality, career, relationships, current decade, 1-2 year insight");
  lines.push("");
  lines.push("Rules: Be specific. Use star archetypes. Analytical tone. End with the standard disclaimer.");
  lines.push("The chart data is engine-computed. Trust the math. Interpret the story.");
}

function getCurrentDecade(chart: ChartData, bd: BirthData) {
  if (!chart.decadeCycles?.length) return null;
  const age = new Date().getFullYear() - bd.year;
  return chart.decadeCycles.find(d => d.startAge <= age && d.endAge >= age) || null;
}

// ── Constants ──

const inputCls = "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 outline-none";
const labelCls = "text-sm font-medium";

function field(label: string, children: React.ReactNode) {
  return (
    <div className="space-y-1.5">
      <Label className={labelCls}>{label}</Label>
      {children}
    </div>
  );
}

// ── Page ──

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

  // Multiple structured events for calibration mode
  const [events, setEvents] = useState<LifeEvent[]>([
    { what: "", when: "", cause: "", impact: "" },
    { what: "", when: "", cause: "", impact: "" },
  ]);

  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const updateEvent = (idx: number, field: keyof LifeEvent, value: string) => {
    setEvents(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const addEvent = () => {
    if (events.length < 4) setEvents(prev => [...prev, { what: "", when: "", cause: "", impact: "" }]);
  };

  const removeEvent = (idx: number) => {
    if (events.length > 2) setEvents(prev => prev.filter((_, i) => i !== idx));
  };

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
        // Validate events
        const filledEvents = events.filter(e => e.what.trim() && e.when.trim() && e.cause.trim() && e.impact.trim());
        if (filledEvents.length < 2) {
          setError("Please fill in ALL fields for at least 2 life events. Each event needs: WHAT, WHEN, CAUSE, and IMPACT. This is critical for accurate calibration.");
          setLoading(false);
          return;
        }

        const birthDay = parseInt(day);
        const charts: ChartData[] = [];
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
        setPromptText(buildCalibrationPrompt(charts, bd, filledEvents));
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">✦ Kismet — Private Reading</h1>
          <Badge variant="secondary" className="text-xs">Engine-Computed</Badge>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Privacy notice */}
        <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-2">
          <p><strong>🔒 100% Private.</strong> Chart computed in your browser. Nothing is stored or sent anywhere.</p>
          <ol className="space-y-1 text-muted-foreground">
            <li>1. Enter birth data → engine computes your chart(s)</li>
            <li>2. Copy prompt → paste into <strong>Claude</strong> (claude.ai)</li>
            <li>3. Claude delivers your reading</li>
          </ol>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button onClick={() => setMode("known")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === "known" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            ✅ I know my birth time
          </button>
          <button onClick={() => setMode("unknown")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === "unknown" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            ❓ I DON'T know my birth time
          </button>
        </div>

        {/* Birth data form */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {field("Year", <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="2003" className={inputCls} />)}
            {field("Month", <input type="number" value={month} onChange={e => setMonth(e.target.value)} placeholder="7" min="1" max="12" className={inputCls} />)}
            {field("Day", <input type="number" value={day} onChange={e => setDay(e.target.value)} placeholder="11" min="1" max="31" className={inputCls} />)}
          </div>

          {mode === "known" && (
            <div className="grid grid-cols-2 gap-3">
              {field("Hour (0-23)", <input type="number" value={hour} onChange={e => setHour(e.target.value)} placeholder="22" min="0" max="23" className={inputCls} />)}
              {field("Minute", <input type="number" value={minute} onChange={e => setMinute(e.target.value)} placeholder="0" min="0" max="59" className={inputCls} />)}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {field("Gender", <select value={gender} onChange={e => setGender(e.target.value as "male" | "female")} className={inputCls}><option value="male">Male</option><option value="female">Female</option></select>)}
            {field("Timezone", <input type="text" value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="Asia/Hong_Kong" className={inputCls} />)}
          </div>

          {field("City Longitude", <>
            <input type="text" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="114.169" className={inputCls} />
            <p className="text-xs text-muted-foreground mt-1">For True Solar Time. Find at <a href="https://www.latlong.net/" target="_blank" rel="noopener" className="underline">latlong.net</a></p>
          </>)}
        </div>

        {/* Calibration events (unknown mode) */}
        {mode === "unknown" && (
          <div className="space-y-5 border rounded-lg p-5 bg-muted/10">
            <div>
              <h3 className="font-semibold">📋 Life Events for Calibration</h3>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Minimum 2 events required.</strong> Each event must have ALL 4 fields filled.
                More events = more accurate calibration. Be specific — vague answers can't narrow down your birth time.
              </p>
            </div>

            {events.map((ev, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3 bg-background">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Event {idx + 1} {idx < 2 ? "(required)" : "(optional)"}</span>
                  {idx >= 2 && (
                    <button onClick={() => removeEvent(idx)} className="text-xs text-destructive hover:underline">Remove</button>
                  )}
                </div>

                {field("WHAT happened?", <>
                  <textarea value={ev.what} onChange={e => updateEvent(idx, "what", e.target.value)} rows={2} placeholder="Describe the event specifically. e.g., 'I was hospitalized for 7 days due to a severe viral infection.'" className={`${inputCls} resize-y min-h-[60px]`} />
                  <p className="text-xs text-muted-foreground">Be specific — what exactly occurred?</p>
                </>)}

                <div className="grid grid-cols-2 gap-3">
                  {field("WHEN did it happen?", <>
                    <input type="text" value={ev.when} onChange={e => updateEvent(idx, "when", e.target.value)} placeholder="e.g., 2026 May" className={inputCls} />
                    <p className="text-xs text-muted-foreground">Year + month is critical for chart matching.</p>
                  </>)}
                  {field("WHAT caused it?", <>
                    <input type="text" value={ev.cause} onChange={e => updateEvent(idx, "cause", e.target.value)} placeholder="e.g., EBV infection from chronic stress" className={inputCls} />
                    <p className="text-xs text-muted-foreground">Root cause or trigger.</p>
                  </>)}
                </div>

                {field("How did it IMPACT you?", <>
                  <textarea value={ev.impact} onChange={e => updateEvent(idx, "impact", e.target.value)} rows={2} placeholder="How did this change your life, mindset, relationships, or direction? e.g., 'I had to quit my job, lost 5kg, and spent 3 months recovering. It forced me to rethink my entire career path.'" className={`${inputCls} resize-y min-h-[60px]`} />
                  <p className="text-xs text-muted-foreground">Life changes, psychological shifts, concrete outcomes.</p>
                </>)}
              </div>
            ))}

            {events.length < 4 && (
              <button onClick={addEvent} className="w-full py-2 border-2 border-dashed rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
                + Add Event {events.length + 1} (improves accuracy)
              </button>
            )}
          </div>
        )}

        {/* Compute */}
        <Button onClick={handleCompute} disabled={loading} className="w-full" size="lg">
          {loading ? "Computing..." : mode === "known" ? "Compute My Chart" : `Compute 12 Charts + Calibrate (${events.filter(e => e.what.trim()).length} events)`}
        </Button>

        {error && <div className="border border-destructive/50 bg-destructive/5 rounded-lg p-3 text-destructive text-sm">{error}</div>}

        {/* Output */}
        {promptText && (
          <div className="space-y-3">
            <h3 className="font-semibold">
              {mode === "known" ? "🤖 Interpretation Prompt" : "🔬 Calibration + Interpretation Prompt"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {mode === "known"
                ? "Paste into Claude. Chart is engine-computed — Claude only interprets."
                : `${events.filter(e => e.what.trim()).length} events × 12 charts. Claude will cross-reference and find your correct birth time.`}
            </p>
            <pre className="bg-card border rounded-lg p-4 text-xs leading-relaxed overflow-auto max-h-96 whitespace-pre-wrap select-all">{promptText}</pre>
            <button onClick={handleCopy} className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${copied ? "bg-primary text-primary-foreground" : "bg-foreground text-background hover:opacity-90"}`}>
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
