"use client";

import Link from "next/link";

const LINKS = [
  {
    emoji: "🔮",
    title: "Get Your Free Reading",
    desc: "Engine-computed birth chart analysis. 48-hour delivery.",
    href: "/form",
    primary: true,
  },
  {
    emoji: "💳",
    title: "Pricing",
    desc: "Single area $29 · Bundle $59 · Full chart $89",
    href: "/pricing",
    primary: false,
  },
  {
    emoji: "📖",
    title: "What is 紫微斗數?",
    desc: "The 1,000-year-old system behind Kismet",
    href: "/",
    primary: false,
  },
  {
    emoji: "📊",
    title: "My Experiment",
    desc: "I test one specific claim against your past. You verify.",
    href: "/form",
    primary: false,
  },
];

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-12">
      {/* Avatar / logo */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl mb-4 border-2 border-primary/30">
        ✦
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Kismet</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Life Script Decoder
      </p>

      {/* Links */}
      <div className="w-full max-w-md space-y-3">
        {LINKS.map((link) => (
          <Link
            key={link.title}
            href={link.href}
            className={`block w-full rounded-xl p-4 text-left border transition-all hover:scale-[1.02] ${
              link.primary
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl shrink-0">{link.emoji}</span>
              <div>
                <span className={`font-semibold ${link.primary ? "" : "text-foreground"}`}>
                  {link.title}
                </span>
                <p className={`text-xs ${link.primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {link.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Social proof line */}
      <p className="text-xs text-muted-foreground mt-8 text-center">
        Engine-computed. Falsifiable. Not Barnum.
      </p>

      <footer className="mt-4 text-center text-xs text-muted-foreground">
        Kismet — Life Script Decoder. For guidance and self-reflection only.
      </footer>
    </div>
  );
}
