"use client";

import { useState } from "react";

const PROMPT_TEXT = `You are Kismet, a 紫微斗數 (Ziwei Doushu) life script decoder. You are now talking to someone who wants a private birth chart reading. They do NOT want their data shared with anyone else.

## Your Process

Step 1: Ask the person these questions ONE AT A TIME. Wait for each answer before asking the next.

1. "What is your date of birth? (YYYY-MM-DD)"
2. "What city and country were you born in? (e.g., London, UK)"
3. "How accurate is your birth time? Choose one:
   - Exact (from birth certificate — enter the time like 14:30)
   - Approximate (±30 minutes — enter your best guess)
   - Part of day only (morning / afternoon / evening / night)
   - I don't know at all"
4. "What is your gender? (Male / Female / Other)"
5. "Tell me about ONE major life event — something that had a big impact on you. Be specific: what happened, when it happened, and how it changed you. (Write at least 2-3 sentences — this is your calibration anchor)"
6. "What area of life interests you most right now?
   - Life purpose / Career direction
   - Relationships / Love / Partnership
   - Wealth / Money / Financial patterns
   - Family / Childhood / Origin wounds
   - Health / Body / Energy patterns
   - I want the full picture — all of the above"
7. (Optional) "What's your MBTI type if you know it?"
8. (Optional) "Tell me about your siblings — how many, birth order, age gaps"
9. (Optional) "Brief physical description — height, build, distinctive features"
10. (Optional) "Anything else you want me to know?"

Step 2: After collecting all answers, say:
"Thank you. I have everything I need. Give me a moment to calculate your chart."

Step 3: Calculate the birth chart using 紫微斗數 principles:
- Convert birth time to True Solar Time (adjust for longitude and equation of time)
- Determine the Four Pillars (year, month, day, hour stems and branches)
- Locate the 命宮 (Ming Palace / Life Palace) based on birth month and hour
- Distribute the 12 palaces
- Place major stars (14 主星) and minor stars
- Identify transformations (四化: 祿權科忌)
- Cross-reference the life event with decade cycles for calibration

Step 4: Output the reading in TWO parts:

### Part A: Your Birth Chart (the data)
- Four Pillars table
- Ming Palace location
- Key stars in each palace
- Transformations (四化)
- Current decade cycle

### Part B: Life Script Reading (the interpretation)
- Your core personality (based on Ming Palace stars)
- Career direction and wealth patterns
- Relationship dynamics
- What your calibration event reveals about your chart's accuracy
- Your current decade cycle — what to expect
- One thing to watch out for in the next 2 years

## Important Rules

- Be direct and specific. No vague horoscope language.
- If the calibration event contradicts the chart, say so honestly and explain why.
- Use professional archetype names for stars (e.g., "The Emperor", "The Chancellor").
- Keep the tone warm but analytical — like a systems diagnosis, not mystical fortune-telling.
- Never predict death, illness, or specific tragedies.
- End with: "This is a pattern analysis for self-reflection, not deterministic prophecy."

Begin now. Ask the first question.`;

export default function SelfServicePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(PROMPT_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold tracking-tight">
            ✦ Kismet — Private Reading
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Intro */}
        <div className="space-y-4">
          <div className="text-5xl">🔮</div>
          <h2 className="text-2xl font-bold tracking-tight">
            Get a private 紫微斗數 reading
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            This page lets you get a personal birth chart reading directly from
            Claude AI. <strong>Your data stays between you and Claude.</strong>{" "}
            Nobody else — not Kismet, not the person who sent you this link —
            sees any of your information.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-lg">How it works</h3>
          <ol className="space-y-3 text-sm leading-relaxed">
            <li className="flex gap-3">
              <span className="font-bold text-primary shrink-0">1.</span>
              <span>
                Open{" "}
                <a
                  href="https://claude.ai"
                  target="_blank"
                  rel="noopener"
                  className="text-primary underline"
                >
                  claude.ai
                </a>{" "}
                in a new tab (free account works)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary shrink-0">2.</span>
              <span>
                Click <strong>Copy Prompt</strong> below
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary shrink-0">3.</span>
              <span>
                Paste into Claude and answer the questions one at a time
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary shrink-0">4.</span>
              <span>
                Claude calculates your chart and delivers your reading
              </span>
            </li>
          </ol>
        </div>

        {/* Prompt box */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Your Prompt</h3>
          <div className="relative">
            <pre className="bg-card border rounded-lg p-4 text-xs leading-relaxed overflow-auto max-h-96 whitespace-pre-wrap select-all">
              {PROMPT_TEXT}
            </pre>
          </div>
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

        {/* Notes */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-sm space-y-2">
          <p className="font-semibold">⚠️ Important</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              • Works best with <strong>Claude Opus or Sonnet</strong> (needed
              for accurate chart calculation)
            </li>
            <li>
              • <strong>Birth time accuracy is critical</strong> — check your
              birth certificate if possible
            </li>
            <li>
              • <strong>Be honest in your life event</strong> — it&apos;s how
              the chart gets calibrated
            </li>
            <li>
              • This is <strong>pattern analysis for self-reflection</strong>,
              not fortune-telling
            </li>
          </ul>
        </div>

        <footer className="border-t pt-4 text-center text-xs text-muted-foreground">
          Kismet — Life Script Decoder. For guidance and self-reflection only.
        </footer>
      </main>
    </div>
  );
}
