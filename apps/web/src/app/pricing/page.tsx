"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Stripe Payment Links — replace with your actual Stripe links after creating them
const STRIPE_LINKS = {
  single: "https://buy.stripe.com/7sY9ASeRO6Ld3Jb7IJgMw08",
  bundle: "https://buy.stripe.com/bJefZg6li5H9djL0ghgMw07",
  full: "https://buy.stripe.com/eVqdR8fVS8Tl0wZfbbgMw06",
  questions5: "https://buy.stripe.com/8x26oGeROc5x5Rj7IJgMw05",
  questions10: "https://buy.stripe.com/5kQ5kC9xu6Ld2F75ABgMw04",
  questions50: "https://buy.stripe.com/cNiaEW7pmc5xfrT7IJgMw03",
  lifetime: "https://buy.stripe.com/3cIbJ0252d9B3JbfbbgMw01",
};

const TIERS = [
  {
    id: "single",
    name: "Single Area Reading",
    emoji: "📊",
    price: 29,
    originalPrice: 49,
    description: "One direction deep-dive analysis",
    features: [
      "1 life direction of your choice",
      "~500 words chart-anchored analysis",
      "3 free follow-up questions",
      "48-hour email delivery",
    ],
    highlight: false,
  },
  {
    id: "bundle",
    name: "3-Area Bundle",
    emoji: "⭐",
    price: 59,
    originalPrice: 87,
    description: "Three directions — most popular",
    features: [
      "3 life directions of your choice",
      "~1500 words chart-anchored analysis",
      "5 free follow-up questions",
      "48-hour email delivery",
      "Save $28 vs buying separately",
    ],
    highlight: true,
  },
  {
    id: "full",
    name: "Full Chart Reading",
    emoji: "🔮",
    price: 89,
    originalPrice: 147,
    description: "All six areas — complete life script",
    features: [
      "All 6 life directions",
      "~3000 words comprehensive analysis",
      "10 free follow-up questions",
      "Priority 24-hour delivery",
      "Event calibration included",
    ],
    highlight: false,
  },
];

const ADDONS = [
  { id: "questions5", name: "5 Questions", emoji: "💬", price: 19, link: STRIPE_LINKS.questions5 },
  { id: "questions10", name: "10 Questions", emoji: "💬", price: 29, link: STRIPE_LINKS.questions10 },
  { id: "questions50", name: "50 Questions", emoji: "💬💬", price: 79, link: STRIPE_LINKS.questions50 },
];

const LIFETIME = {
  name: "Lifetime Access",
  emoji: "♾️",
  price: 149,
  originalPrice: 299,
  features: [
    "All 6 areas + future updates",
    "100 questions included",
    "Priority forever",
    "One-time payment",
  ],
};

const DIRECTIONS = [
  { emoji: "💰", name: "Wealth Architecture", desc: "Money patterns, risk profile, wealth strategy" },
  { emoji: "👥", name: "Social & Community", desc: "Friendships, network, social dynamics" },
  { emoji: "💕", name: "Love & Partnership", desc: "Relationship patterns, what you attract" },
  { emoji: "🏠", name: "Roots & Origin", desc: "Family dynamics, home, foundation" },
  { emoji: "💼", name: "Vocation & Calling", desc: "Career direction, work style, purpose" },
  { emoji: "🧬", name: "Core Architecture", desc: "Personality, mindset, operating system" },
];

export default function PricingPage() {
  const [showDirections, setShowDirections] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">✦ Kismet</h1>
          <Badge variant="secondary" className="text-xs">Early Access</Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="text-5xl">🔮</div>
          <h2 className="text-3xl font-bold tracking-tight">
            Your Life Script, Decoded
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Engine-computed 紫微斗數 analysis. Not horoscope generalities —
            specific, chart-anchored, falsifiable claims about your pattern architecture.
          </p>
          <Badge variant="secondary" className="text-sm px-4 py-1.5">
            🚀 Early Adopter Pricing — First 100 Customers
          </Badge>
        </div>

        {/* Directions */}
        <div className="bg-muted/30 rounded-lg p-6">
          <button
            onClick={() => setShowDirections(!showDirections)}
            className="w-full text-left font-semibold text-lg flex items-center justify-between"
          >
            The 6 Life Directions
            <span className="text-muted-foreground">{showDirections ? "▲" : "▼"}</span>
          </button>
          {showDirections && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {DIRECTIONS.map((d) => (
                <div key={d.name} className="bg-background border rounded-lg p-3 text-sm">
                  <span className="font-medium">{d.emoji} {d.name}</span>
                  <p className="text-muted-foreground text-xs mt-1">{d.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`border rounded-xl p-6 flex flex-col ${
                tier.highlight
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "bg-card"
              }`}
            >
              {tier.highlight && (
                <Badge className="self-start mb-3">Most Popular</Badge>
              )}
              <div className="text-2xl mb-1">{tier.emoji}</div>
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
              <div className="mb-4">
                <span className="text-3xl font-bold">${tier.price}</span>
                <span className="text-muted-foreground line-through ml-2">${tier.originalPrice}</span>
              </div>
              <ul className="space-y-2 text-sm mb-6 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={STRIPE_LINKS[tier.id as keyof typeof STRIPE_LINKS]}
                target="_blank"
                rel="noopener"
                className="w-full"
              >
                <Button className="w-full" variant={tier.highlight ? "default" : "outline"}>
                  Get Started — ${tier.price}
                </Button>
              </a>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">💬 Extra Questions</h3>
          <p className="text-sm text-muted-foreground">
            Already have a reading? Add more questions anytime.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {ADDONS.map((addon) => (
              <a
                key={addon.id}
                href={addon.link}
                target="_blank"
                rel="noopener"
                className="border rounded-lg p-4 hover:border-primary/50 transition-colors text-center"
              >
                <div className="text-xl mb-1">{addon.emoji}</div>
                <div className="font-semibold">{addon.name}</div>
                <div className="text-lg font-bold">${addon.price}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Lifetime */}
        <div className="border rounded-xl p-6 bg-card text-center max-w-md mx-auto">
          <div className="text-3xl mb-2">{LIFETIME.emoji}</div>
          <h3 className="text-xl font-semibold">{LIFETIME.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">Everything. Forever.</p>
          <div className="mb-4">
            <span className="text-3xl font-bold">${LIFETIME.price}</span>
            <span className="text-muted-foreground line-through ml-2">${LIFETIME.originalPrice}</span>
          </div>
          <ul className="space-y-2 text-sm mb-6">
            {LIFETIME.features.map((f, i) => (
              <li key={i}>✓ {f}</li>
            ))}
          </ul>
          <a href={STRIPE_LINKS.lifetime} target="_blank" rel="noopener">
            <Button className="w-full" size="lg">
              Get Lifetime — ${LIFETIME.price}
            </Button>
          </a>
        </div>

        {/* Risk Reversal */}
        <div className="text-center bg-muted/30 rounded-lg p-6">
          <p className="text-lg font-semibold">🔒 If Anything Feels Generic, You Don't Pay</p>
          <p className="text-sm text-muted-foreground mt-1">
            Every claim is anchored to specific chart data. If a claim can't be tied to a star,
            palace, pillar, or transformation — it doesn't belong in your reading.
            <br />
            Not satisfied? Full refund. No questions asked.
          </p>
        </div>

        <footer className="border-t pt-4 text-center text-xs text-muted-foreground">
          Kismet — Life Script Decoder. Pattern analysis, not fortune-telling.
        </footer>
      </main>
    </div>
  );
}
