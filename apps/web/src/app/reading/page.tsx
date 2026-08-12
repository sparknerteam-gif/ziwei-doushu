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
import PasswordGate from "@/components/PasswordGate";

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
  lines.push("## 🎯 Calibration Protocol (3-Phase)");
  lines.push("");
  lines.push("### Phase 1: Event Matching");
  lines.push("");
  lines.push("For each life event, check ALL 12 charts. Mark which shichen can explain that event:");
  lines.push("- Look at the relevant palace for each event (Health→疾厄, Wealth→財帛, Home→田宅, Career→事業, etc.)");
  lines.push("- Check the Decade Cycle at the event's year — is the relevant palace activated?");
  lines.push("- Check Transformations (四化) — does a 化忌 point to the affected area?");
  lines.push("- Check the Four Pillars — do the day/hour pillars clash with the event year?");
  lines.push("");
  for (let i = 0; i < events.length; i++) {
    lines.push(`**Event ${i + 1}** ("${events[i].what.substring(0, 60)}..."):`);
    lines.push(`  - Year: ${events[i].when} — check流年 stem/branch for that year`);
    lines.push(`  - Nature: ${events[i].cause} — which palace does this involve?`);
    lines.push(`  - Impact: ${events[i].impact.substring(0, 60)}... — severity and life area affected`);
    lines.push(`  - Shichen that match: [your analysis]`);
    lines.push(`  - Shichen ELIMINATED: [list them]`);
    lines.push("");
  }
  lines.push("### Phase 2: Candidate Shortlist");
  lines.push("");
  lines.push("Create a scoring matrix. Which shichen survive ALL event filters?");
  lines.push("");
  lines.push("| Shichen | Score | Verdict |");
  lines.push("|---|---|---|");
  lines.push("| (list all 12) | X/events.length | MATCH / ELIMINATED |");
  lines.push("");
  lines.push("**If only ONE shichen scores perfectly:** → Skip to Phase 4. That's your calibrated birth time.");
  lines.push("");
  lines.push("**If 2-3 shichen tie:** → Go to Phase 3 (Differential Diagnosis).");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("### Phase 3: Differential Diagnosis (CRITICAL — only if tie)");
  lines.push("");
  lines.push("This is the key step. When multiple shichen survive event matching, you must DESIGN targeted binary questions that ONLY ONE shichen can answer correctly.");
  lines.push("");
  lines.push("**How to design differential questions:**");
  lines.push("1. Compare the REMAINING candidates' Ming Palace stars, Health Palace, Wealth Palace");
  lines.push("2. Find traits where the candidates DIFFER:");
  lines.push("   - Different Ming stars → different personality, risk tolerance, social style");
  lines.push("   - Different Health Palace stars → different body/illness patterns");
  lines.push("   - Different Wealth Palace stars → different money behavior");
  lines.push("   - Different Transformations → different life area stress points");
  lines.push("3. Craft 2-3 binary (A/B) questions that exploit these differences");
  lines.push("4. Each question should make Candidate A choose option A, Candidate B choose option B");
  lines.push("");
  lines.push("**Example (from a real calibration):**");
  lines.push("Candidates: 丑/未時 (天機巨門, conservative health) vs 亥時 (廉貞貪狼, risk-taking health)");
  lines.push("Q1 (tests Health Palace difference): 'Was hospitalization: A) acute internal illness, or B) surgery/accident?'");
  lines.push("  → 亥時廉貞 = internal/immune → A. 丑未時 = external trauma pattern → B.");
  lines.push("Q2 (tests Wealth Palace difference): 'Are you: A) usually frugal, got tempted once, or B) naturally a risk-taker?'");
  lines.push("  → 亥時貪狼 = natural gambler → B. 丑未時天機 = cautious analyst → A.");
  lines.push("");
  lines.push("**Output your differential questions clearly**, then state:");
  lines.push("'Based on the answers, I select [SHICHEN] as the calibrated birth time because [reasoning].'");
  lines.push("");
  lines.push("If this is a one-shot prompt and you can't ask the user, state your BEST GUESS with confidence level, and deliver the reading for that shichen. Explain what assumptions you made.");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("### Phase 4: Full Reading for Calibrated Chart");
  lines.push("");
  lines.push("Using the SELECTED chart, deliver:");
  lines.push("- **Core personality**: From Ming Palace stars — be specific. What do these stars make this person?");
  lines.push("- **Career & wealth**: Direction, strengths, risks");
  lines.push("- **Relationships**: Patterns, what they attract, what they need");
  lines.push("- **Event verification**: How does the selected chart explain EACH life event? (This proves the calibration is right)");
  lines.push("- **Current decade cycle**: Themes, opportunities, challenges");
  lines.push("- **1-2 year insight**: One specific thing to watch or act on");
  lines.push("");
  lines.push("## Rules");
  lines.push("- Show your calibration work. Don't just announce the answer — prove it.");
  lines.push("- Quote specific stars, palaces, and pillars from the chart data.");
  lines.push("");
  lines.push("## ⛔ ANTI-BARNUM: Every claim MUST cite chart data. No anchor = delete the claim.");
  lines.push("");
  lines.push("## 🌐 WESTERN ADAPTATION: Archetypes (The Sovereign, The Maverick, The Alchemist). No 'destiny/fate' language. Agency framing. Probabilistic, not predictive.");
  lines.push("");
  lines.push("- If confidence is low due to ambiguous events, say so honestly.");
  lines.push("- End by asking the person to validate each claim (✅/❌/🤷) for training feedback.");
  lines.push("- End with: 'This is a pattern architecture analysis for self-reflection, not deterministic prophecy. Your choices matter.'");

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
  lines.push("---");
  lines.push("");
  lines.push("## ⛔ ANTI-BARNUM RULES (MANDATORY)");
  lines.push("");
  lines.push("The #1 failure mode of astrology is Barnum statements — vague claims that anyone would agree with. Kismet exists to solve this. Follow these rules or the reading is worthless:");
  lines.push("");
  lines.push("1. **Every claim MUST cite specific chart data.** Format: '[Claim] — because [Star] in [Palace] creates [specific dynamic].' If you cannot anchor a claim to a specific star, palace, pillar, or transformation, DELETE that claim.");
  lines.push("2. **No claim without a chart anchor.** Before writing any interpretation, ask: 'Which chart element proves this?' If the answer is 'none,' skip it.");
  lines.push("3. **Specific beats general.** 'Your Ming Palace Lian-Zhen + Po-Jun creates friction with authority' NOT 'You sometimes struggle with authority figures.'");
  lines.push("4. **Event-anchored.** Whenever possible, connect traits to specific years and events: 'Your 2023 event aligns with Tan-Lang Transformation to Obstacle hitting your Wealth Palace.'");
  lines.push("5. **Falsifiability required.** Every claim must be something the person could say 'No, that's wrong' to. If they couldn't disagree, it's Barnum.");
  lines.push("6. **Bad example:** 'You have a rich inner world.' ← Barnum. Everyone says yes.");
  lines.push("   **Good example:** 'Your Core Self has The Moon (Tai-Yin) with The Artist (Wen-Chang) — you process emotions through creative output. When stressed, you withdraw into an elaborate internal landscape that others can't access.' ← Specific, anchored, falsifiable.");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 🌐 WESTERN CULTURAL ADAPTATION");
  lines.push("");
  lines.push("This reading is for a Western English-speaking audience. Adapt accordingly:");
  lines.push("");
  lines.push("- **Use archetypes, not titles.** 紫微 = The Sovereign (not The Emperor). 貪狼 = The Maverick (not The Wolf). 七殺 = The Vanguard (not The Killer).");
  lines.push("- **No mystical language.** Never say 'destiny,' 'fate,' 'auspicious,' 'inauspicious.' Say 'pattern,' 'architecture,' 'high-probability window,' 'friction point.'");
  lines.push("- **Systems thinking.** Frame as operating system analysis: 'Your Core Self is configured with two archetypes that create a specific dynamic...'");
  lines.push("- **Agency is everything.** End every major section with agency: 'This is the pattern. How you work with it is your design.'");
  lines.push("- **Probabilistic, not predictive.** 'People with this configuration tend to...' NOT 'You will...'");
  lines.push("- **Pair every challenge with a strategy.** Don't just name the shadow — name the integration path.");
  lines.push("- **End with:** 'This is a pattern architecture analysis for self-reflection, not deterministic prophecy. Your choices matter.'");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 📊 FEEDBACK REQUEST (FOR TRAINING)");
  lines.push("");
  lines.push("At the end of your reading, ask the person to validate your claims:");
  lines.push("");
  lines.push("```");
  lines.push("📊 Help me get more accurate:");
  lines.push("For each numbered claim above, reply with:");
  lines.push("✅ = This is accurate — it describes me or my experience");
  lines.push("❌ = This is wrong — it doesn't match my reality");
  lines.push("🤷 = Not sure / doesn't apply");
  lines.push("");
  lines.push("Your feedback trains the system. Honest 'no' answers are just as valuable as 'yes.'");
  lines.push("```");
  lines.push("");
  lines.push("The chart data is engine-computed. Trust the math. Interpret the story. Demand feedback.");
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
    <PasswordGate>
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
                <strong>Minimum 2 events required.</strong> Each event fills ALL 4 fields.
                More events = exponentially more accurate calibration.
              </p>
            </div>

            {/* Examples guide */}
            <details className="bg-background border rounded-lg p-4 text-sm">
              <summary className="font-medium cursor-pointer">📖 What makes a good event? (Click to expand examples)</summary>
              <div className="mt-3 space-y-4">
                <div>
                  <p className="font-medium text-green-600 dark:text-green-400 mb-2">✅ GOOD events (specific, dated, extreme, irreversible):</p>
                  <div className="space-y-3">
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3">
                      <p className="font-medium">💸 Wealth Loss</p>
                      <p className="text-muted-foreground"><strong>WHAT:</strong> I lost 90% of my savings (~$40K USD) in cryptocurrency futures trading</p>
                      <p className="text-muted-foreground"><strong>WHEN:</strong> 2023 November</p>
                      <p className="text-muted-foreground"><strong>CAUSE:</strong> Over-leveraged trades during the FTX crash, margin called</p>
                      <p className="text-muted-foreground"><strong>IMPACT:</strong> Had to move back in with parents. Took 18 months to recover financially and psychologically. Completely changed my risk tolerance — I no longer touch leverage.</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3">
                      <p className="font-medium">🏥 Health Crisis</p>
                      <p className="text-muted-foreground"><strong>WHAT:</strong> Hospitalized for 7 days with severe viral infection (EBV/mononucleosis)</p>
                      <p className="text-muted-foreground"><strong>WHEN:</strong> 2026 May</p>
                      <p className="text-muted-foreground"><strong>CAUSE:</strong> Chronic stress + immune system collapse from overwork</p>
                      <p className="text-muted-foreground"><strong>IMPACT:</strong> Forced to stop working for 3 months. Lost 5kg. Made me completely rethink my relationship with work and stress.</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3">
                      <p className="font-medium">🏠 Major Relocation</p>
                      <p className="text-muted-foreground"><strong>WHAT:</strong> Moved to a new city for a job, then moved back to my hometown 12 months later</p>
                      <p className="text-muted-foreground"><strong>WHEN:</strong> 2024 March (moved out), 2025 March (moved back)</p>
                      <p className="text-muted-foreground"><strong>CAUSE:</strong> Job offer seemed perfect but the work culture was toxic and isolating</p>
                      <p className="text-muted-foreground"><strong>IMPACT:</strong> Realized environment matters more than salary. Became much more careful about evaluating workplaces.</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3">
                      <p className="font-medium">💔 Relationship Breakup</p>
                      <p className="text-muted-foreground"><strong>WHAT:</strong> Ended a 2-year serious relationship — we were discussing marriage</p>
                      <p className="text-muted-foreground"><strong>WHEN:</strong> 2024 September</p>
                      <p className="text-muted-foreground"><strong>CAUSE:</strong> Fundamental value mismatch that became impossible to ignore</p>
                      <p className="text-muted-foreground"><strong>IMPACT:</strong> Spent 6 months in deep introspection. Changed what I look for in a partner — from chemistry to character alignment.</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3">
                      <p className="font-medium">🎓 Career/Edu Pivot</p>
                      <p className="text-muted-foreground"><strong>WHAT:</strong> Dropped out of university in 2nd year to start a business, then the business failed</p>
                      <p className="text-muted-foreground"><strong>WHEN:</strong> 2022 September (dropped out), 2023 June (business failed)</p>
                      <p className="text-muted-foreground"><strong>CAUSE:</strong> Believed the degree was useless, overestimated my ability to execute solo</p>
                      <p className="text-muted-foreground"><strong>IMPACT:</strong> Went back to finish degree in 2024. Humbled me. Now I test ideas part-time before going all-in.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-red-600 dark:text-red-400 mb-2">❌ BAD events (vague, undated, trivial, no impact):</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• "I had money problems" → Too vague. How much? When? Why?</li>
                    <li>• "I was sick once" → What illness? How long? What year?</li>
                    <li>• "My parents argued a lot" → No specific event, no date, no impact on you</li>
                    <li>• "I changed jobs a few times" → Which job? When? What happened?</li>
                    <li>• "I felt sad in 2020" → Everyone did. What specifically happened to YOU?</li>
                  </ul>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded p-3">
                  <p className="font-medium">💡 Key Rules for Effective Events:</p>
                  <ol className="space-y-1 text-muted-foreground mt-1">
                    <li>1. <strong>Extreme outcomes only</strong> — hospitalization, bankruptcy, divorce, relocation, major loss. Small events don't leave marks on the chart.</li>
                    <li>2. <strong>Specific year + month</strong> — "2023 Nov" not "a few years ago". Month matters for 流月 matching.</li>
                    <li>3. <strong>Irreversible change</strong> — events that permanently changed your direction, not minor setbacks.</li>
                    <li>4. <strong>Cross life areas</strong> — best to have events from DIFFERENT areas (e.g., one health + one wealth + one relationship), not 3 events all about money.</li>
                  </ol>
                </div>
              </div>
            </details>

            {events.map((ev, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3 bg-background">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Event {idx + 1} {idx < 2 ? "(required)" : "(optional)"}</span>
                  {idx >= 2 && (
                    <button onClick={() => removeEvent(idx)} className="text-xs text-destructive hover:underline">Remove</button>
                  )}
                </div>

                {field("WHAT happened? (be brutally specific)", <>
                  <textarea value={ev.what} onChange={e => updateEvent(idx, "what", e.target.value)} rows={2} placeholder={"e.g., 'I lost 90% of my savings (~$40K) in crypto futures and had to move back in with my parents.'\n\ne.g., 'I was hospitalized for 7 days with a severe viral infection that shut down my immune system.'\n\ne.g., 'I ended a 2-year relationship where we were discussing marriage — she left without warning.'"} className={`${inputCls} resize-y min-h-[60px]`} />
                </>)}

                <div className="grid grid-cols-2 gap-3">
                  {field("WHEN? (year + month)", <>
                    <input type="text" value={ev.when} onChange={e => updateEvent(idx, "when", e.target.value)} placeholder="e.g., 2023 November" className={inputCls} />
                  </>)}
                  {field("WHAT caused/triggered it?", <>
                    <input type="text" value={ev.cause} onChange={e => updateEvent(idx, "cause", e.target.value)} placeholder="e.g., Over-leveraged trades during market crash" className={inputCls} />
                  </>)}
                </div>

                {field("How did it IMPACT/CHANGE you? (concrete outcomes)", <>
                  <textarea value={ev.impact} onChange={e => updateEvent(idx, "impact", e.target.value)} rows={2} placeholder={"e.g., 'I moved back home, lost my independence, took 18 months to recover. I no longer touch leverage or trade emotionally.'\n\ne.g., 'I quit my job, lost 5kg, spent 3 months recovering. It forced me to completely rethink my relationship with work and stress.'"} className={`${inputCls} resize-y min-h-[60px]`} />
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
    </PasswordGate>
  );
}
