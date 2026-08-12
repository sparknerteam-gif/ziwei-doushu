"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-6 py-8">
          <div className="text-6xl">🔮</div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Your Life Script, Decoded
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Kismet uses an engine-computed 紫微斗數 system to decode your pattern architecture.
            <br className="hidden sm:block" />
            Not horoscope generalities. Specific, falsifiable claims about your life.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/form">
              <Button size="lg" className="px-8">Get Your Free Reading →</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="px-8">View Pricing</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Free preview. 48-hour delivery. No payment required upfront.
          </p>
        </div>

        {/* What is Ziwei Doushu */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center">What is 紫微斗數?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-xl p-6 space-y-2">
              <div className="text-3xl">⭐</div>
              <h4 className="font-semibold">The Purple Star System</h4>
              <p className="text-sm text-muted-foreground">
                紫微斗數 (Ziwei Doushu) is a 1,000-year-old Chinese system that maps your life
                pattern from your birth time. It charts 14 major stars across 12 palaces,
                each representing a different life domain.
              </p>
            </div>
            <div className="border rounded-xl p-6 space-y-2">
              <div className="text-3xl">🧮</div>
              <h4 className="font-semibold">Engine-Computed</h4>
              <p className="text-sm text-muted-foreground">
                Unlike traditional astrologers who read charts &quot;intuitively,&quot; Kismet computes
                every chart deterministically — Four Pillars, star placements, and transformations
                are all calculated by a mathematical engine with true solar time correction.
              </p>
            </div>
            <div className="border rounded-xl p-6 space-y-2">
              <div className="text-3xl">🎯</div>
              <h4 className="font-semibold">Falsifiable, Not Barnum</h4>
              <p className="text-sm text-muted-foreground">
                Most astrology says vague things anyone would agree with. Kismet makes specific
                claims tied to specific chart elements — claims that can be right or wrong.
                If it&apos;s wrong, you&apos;ll know. That&apos;s the point.
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "1", title: "Share Your Birth Data", desc: "Date, city, and birth time. The more precise, the more accurate your chart." },
              { num: "2", title: "We Calibrate Your Chart", desc: "Your past life events verify the chart — like GPS locking onto your coordinates." },
              { num: "3", title: "Receive Your Reading", desc: "A specific, chart-anchored analysis delivered to your DM or email within 48 hours." },
            ].map((s) => (
              <div key={s.num} className="border rounded-xl p-6 space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto">
                  {s.num}
                </div>
                <h4 className="font-semibold">{s.title}</h4>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The 6 life directions */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center">Six Life Directions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { emoji: "💰", name: "Wealth Architecture", desc: "Money patterns & risk profile" },
              { emoji: "👥", name: "Social & Community", desc: "Friendships & network dynamics" },
              { emoji: "💕", name: "Love & Partnership", desc: "Relationship patterns" },
              { emoji: "🏠", name: "Roots & Origin", desc: "Family & foundation" },
              { emoji: "💼", name: "Vocation & Calling", desc: "Career direction" },
              { emoji: "🧬", name: "Core Architecture", desc: "Personality & operating system" },
            ].map((d) => (
              <div key={d.name} className="border rounded-lg p-4 text-sm flex items-center gap-3">
                <span className="text-2xl">{d.emoji}</span>
                <div>
                  <span className="font-medium">{d.name}</span>
                  <p className="text-muted-foreground text-xs">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk reversal */}
        <div className="bg-muted/30 rounded-xl p-8 text-center space-y-3">
          <p className="text-xl font-semibold">🔒 If Anything Feels Generic, You Don&apos;t Pay</p>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every claim is anchored to specific chart data. If a claim can&apos;t be tied to a star,
            palace, pillar, or transformation — it doesn&apos;t belong in your reading.
          </p>
        </div>

        {/* Final CTA */}
        <div className="text-center space-y-4 py-8">
          <h3 className="text-3xl font-bold">Ready to Decode Your Script?</h3>
          <Link href="/form">
            <Button size="lg" className="px-10">Get Your Free Reading →</Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Free. Private. Pattern analysis, not fortune-telling.
          </p>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Kismet — Life Script Decoder. For guidance and self-reflection only.
      </footer>
    </div>
  );
}
