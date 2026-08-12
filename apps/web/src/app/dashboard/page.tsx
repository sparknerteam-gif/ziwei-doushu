"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Submission {
  submittedAt: string;
  birthDate: string;
  birthCity: string;
  birthTimeAccuracy: string;
  exactBirthTime: string | null;
  partOfDay: string | null;
  gender: string;
  lifeEvent1: string;
  lifeEvent2: string | null;
  lifeEvent3: string | null;
  email: string;
  socialHandle: string;
  interestArea: string;
  siblings: string | null;
  physical: string | null;
  mbti: string | null;
  anythingElse: string | null;
}

const INTEREST_LABELS: Record<string, string> = {
  career: "💼 Career",
  love: "💕 Love",
  wealth: "💰 Wealth",
  family: "🏠 Family",
  health: "🧬 Health",
  full: "🌐 Full Picture",
};

const ACCURACY_LABELS: Record<string, string> = {
  exact: "Exact",
  approximate: "Approx",
  part: "Part of day",
  unknown: "Unknown",
};

function mergeSubmissions(local: Submission[], server: Submission[]): Submission[] {
  const seen = new Set<string>();
  const merged: Submission[] = [];

  for (const s of [...server, ...local]) {
    const key = `${s.submittedAt}|${s.email}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(s);
    }
  }

  merged.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  return merged;
}

export default function DashboardPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [dmIdx, setDMIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for saved password on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("kismet-dash-pw");
    if (saved) {
      setPassword(saved);
      fetchSubmissions(saved);
    }
  }, []);

  const fetchSubmissions = async (pw?: string) => {
    const pwd = pw || password;
    if (!pwd) return;

    setLoading(true);
    try {
      const cachedRaw = localStorage.getItem("kismet-local-submissions");
      const cached: Submission[] = cachedRaw ? JSON.parse(cachedRaw) : [];

      // Send password in Authorization header — never appears in URL
      const res = await fetch("/api/submit-form?action=list", {
        headers: {
          Authorization: `Bearer ${pwd}`,
        },
      });

      if (res.status === 401) {
        setAuthError("Incorrect password");
        sessionStorage.removeItem("kismet-dash-pw");
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      const serverSubs: Submission[] = data.submissions || [];
      const merged = mergeSubmissions(cached, serverSubs);
      setSubmissions(merged);
      setTotal(merged.length);
      setAuthenticated(true);
      setAuthError("");
      sessionStorage.setItem("kismet-dash-pw", pwd);
    } catch (err) {
      console.error("Fetch error:", err);
      const cachedRaw = localStorage.getItem("kismet-local-submissions");
      if (cachedRaw) {
        const cached: Submission[] = JSON.parse(cachedRaw);
        setSubmissions(cached);
        setTotal(cached.length);
        setAuthenticated(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Poll every 60 seconds
  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(() => fetchSubmissions(), 60000);
    return () => clearInterval(interval);
  }, [authenticated, password]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubmissions();
  };

  const buildCalibrationPrompt = (s: Submission) => {
    const parts = [
      "calibrate this lead",
      "",
      "--- Birth Data ---",
      `DOB: ${s.birthDate}`,
      `City: ${s.birthCity}`,
      `Time Accuracy: ${s.birthTimeAccuracy}`,
      `Exact Time: ${s.exactBirthTime || "n/a"}`,
      `Part of Day: ${s.partOfDay || "n/a"}`,
      `Gender: ${s.gender}`,
      "",
      "--- Life Event ---",
      s.lifeEvent1,
    ];
    if (s.lifeEvent2) parts.push(`\nEvent 2: ${s.lifeEvent2}`);
    if (s.lifeEvent3) parts.push(`\nEvent 3: ${s.lifeEvent3}`);
    parts.push(
      ``,
      `--- Contact ---`,
      `Email: ${s.email}`,
      `Social: ${s.socialHandle}`,
      `Interest: ${s.interestArea}`,
    );
    if (s.siblings) parts.push(`\nSiblings: ${s.siblings}`);
    if (s.physical) parts.push(`\nPhysical: ${s.physical}`);
    if (s.mbti) parts.push(`\nMBTI: ${s.mbti}`);
    if (s.anythingElse) parts.push(`\nOther: ${s.anythingElse}`);
    return parts.join("\n");
  };

  const buildDM = (s: Submission) => {
    const interest = s.interestArea === "career" ? "career direction" :
      s.interestArea === "love" ? "relationships" :
      s.interestArea === "wealth" ? "money patterns" :
      s.interestArea === "family" ? "family dynamics" :
      s.interestArea === "health" ? "health and energy" : "life patterns";

    const lines = [
      `Hey — Kismet here. I ran your chart for ${s.birthDate}.`,
      "",
      `Two things I can see immediately from your chart data:`,
      "",
      `1. Your ${interest} architecture shows a specific pattern — [INSERT CHART-ANCHORED CLAIM after calibration]. This isn't generic. I can point to the exact star and palace behind this.`,
      "",
      `2. Your ${s.lifeEvent1.substring(0, 60).toLowerCase()}... — this event aligns with [INSERT YEAR/PALACE/TRANSFORMATION after calibration]. The timing isn't random.`,
      "",
      `These claims are tied to specific chart elements. If they're wrong, they're falsifiable. If they're right — and I think they will be — you'll know this isn't horoscope generalities.`,
      "",
      `Full reading: $29 for your ${s.interestArea === 'full' ? 'complete chart' : interest} analysis. 3 free follow-up questions included. If anything feels Barnum or generic, you don't pay.`,
      "",
      `Want the full picture?`,
      `— Kismet`,
    ];
    return lines.join("\n");
  };

  const copyDM = async (s: Submission, idx: number) => {
    await navigator.clipboard.writeText(buildDM(s));
    setDMIdx(idx);
    setTimeout(() => setDMIdx(null), 2000);
  };

  const copyToClipboard = async (s: Submission, idx: number) => {
    await navigator.clipboard.writeText(buildCalibrationPrompt(s));
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadLeadFile = (s: Submission) => {
    const content = buildLeadFile(s);
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const name = (s.socialHandle || "lead").replace(/[^a-zA-Z0-9_-]/g, "_");
    const date = s.submittedAt?.slice(0, 10) || "unknown";
    a.href = url;
    a.download = `${date}_${name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildLeadFile = (s: Submission) => {
    const parts = [
      `# Lead: ${s.socialHandle || "Unknown"}`,
      `> Submitted: ${s.submittedAt}`,
      "",
      "---",
      "",
      "## 📋 Raw Data",
      "",
      "| Field | Value |",
      "|---|---|",
      `| DOB | ${s.birthDate} |`,
      `| City | ${s.birthCity} |`,
      `| Time Accuracy | ${s.birthTimeAccuracy} |`,
      `| Exact Time | ${s.exactBirthTime || "n/a"} |`,
      `| Part of Day | ${s.partOfDay || "n/a"} |`,
      `| Gender | ${s.gender} |`,
      `| Email | ${s.email} |`,
      `| Social | ${s.socialHandle} |`,
      `| Interest | ${s.interestArea} |`,
      `| MBTI | ${s.mbti || "n/a"} |`,
      `| Siblings | ${s.siblings || "n/a"} |`,
      `| Physical | ${s.physical || "n/a"} |`,
      "",
      "---",
      "",
      "## 🔮 Calibration Prompt",
      "",
      "Paste the block below into Claude (kismet-engine):",
      "",
      "```",
      buildCalibrationPrompt(s),
      "```",
      "",
      "---",
      "",
      "## 📖 Reading Output",
      "",
      "*(Paste Claude's calibration report + DM script here)*",
      "",
      "### Internal Calibration Report",
      "",
      "*(for Hugo's eyes only)*",
      "",
      "### DM Script",
      "",
      "*(copy-paste to lead)*",
      "",
      "---",
      "",
      "## 📨 Follow-up Log",
      "",
      "| Date | Action | Notes |",
      "|---|---|---|",
      "| | DM Sent | |",
      "| | Reply Received | |",
      "| | Reading Delivered | |",
      "| | Paid Consultation | |",
    ];
    return parts.join("\n");
  };

  // ── PASSWORD GATE ──
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <h1 className="text-xl font-semibold tracking-tight">✦ Kismet Dashboard</h1>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-xl font-semibold mb-2">Dashboard Access</h2>
            <p className="text-sm text-muted-foreground">
              Enter the dashboard password to view submissions.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError("");
                }}
                placeholder="Enter dashboard password"
                autoFocus
              />
            </div>
            {authError && (
              <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">
                ⚠ {authError}
              </p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={!password || loading}>
              {loading ? "Checking..." : "Unlock Dashboard"}
            </Button>
          </form>
        </main>
      </div>
    );
  }

  // ── LOADING ──
  if (loading && submissions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">✦ Kismet Dashboard</h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full mb-4" />
          <p className="text-lg text-muted-foreground">Loading submissions...</p>
        </main>
      </div>
    );
  }

  // ── EMPTY ──
  if (submissions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">✦ Kismet Dashboard</h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg text-muted-foreground">No submissions yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            When someone fills the form, they&apos;ll appear here.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => fetchSubmissions()}>
            Refresh
          </Button>
        </main>
      </div>
    );
  }

  // ── DATA ──
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">✦ Kismet Dashboard</h1>
            <Badge variant="secondary" className="text-xs">
              {total} submission{total !== 1 ? "s" : ""}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchSubmissions()}>
            Refresh
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {submissions.map((s, idx) => (
          <div
            key={idx}
            className="border rounded-lg bg-card overflow-hidden transition-colors"
          >
            {/* Summary Row */}
            <button
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              className="w-full text-left px-5 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">
                    {INTEREST_LABELS[s.interestArea] || s.interestArea}
                  </span>
                  <span className="text-sm text-muted-foreground truncate">
                    {s.socialHandle}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {new Date(s.submittedAt).toLocaleString("en-HK", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {ACCURACY_LABELS[s.birthTimeAccuracy] || s.birthTimeAccuracy}
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    {expanded === idx ? "▲" : "▼"}
                  </span>
                </div>
              </div>
            </button>

            {/* Expanded Detail */}
            {expanded === idx && (
              <div className="px-5 pb-5 border-t pt-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">DOB</span>
                    <p className="font-medium">{s.birthDate || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">City</span>
                    <p className="font-medium truncate" title={s.birthCity}>{s.birthCity || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time</span>
                    <p className="font-medium">
                      {s.exactBirthTime || s.partOfDay || s.birthTimeAccuracy}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender</span>
                    <p className="font-medium">{s.gender}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email</span>
                    <p className="font-medium truncate" title={s.email}>{s.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">MBTI</span>
                    <p className="font-medium">{s.mbti || "Unknown"}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Life Event</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{s.lifeEvent1}</p>
                  {s.lifeEvent2 && (
                    <p className="text-sm leading-relaxed mt-2 text-muted-foreground whitespace-pre-wrap">
                      <strong>Event 2:</strong> {s.lifeEvent2}
                    </p>
                  )}
                  {s.lifeEvent3 && (
                    <p className="text-sm leading-relaxed mt-2 text-muted-foreground whitespace-pre-wrap">
                      <strong>Event 3:</strong> {s.lifeEvent3}
                    </p>
                  )}
                </div>

                {(s.siblings || s.physical || s.anythingElse) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {s.siblings && (
                        <div>
                          <span className="text-muted-foreground">Siblings</span>
                          <p className="font-medium">{s.siblings}</p>
                        </div>
                      )}
                      {s.physical && (
                        <div>
                          <span className="text-muted-foreground">Physical</span>
                          <p className="font-medium">{s.physical}</p>
                        </div>
                      )}
                    </div>
                    {s.anythingElse && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Other</span>
                        <p className="leading-relaxed mt-1">{s.anythingElse}</p>
                      </div>
                    )}
                  </>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(s, idx)}
                    variant={copied === idx ? "default" : "outline"}
                  >
                    {copied === idx ? "✓ Copied!" : "📋 Copy Prompt"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => copyDM(s, idx)}
                    variant={dmIdx === idx ? "default" : "outline"}
                  >
                    {dmIdx === idx ? "✓ Copied!" : "📩 Copy DM"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => downloadLeadFile(s)}
                    variant="outline"
                  >
                    💾 Save Lead File
                  </Button>
                </div>

                {/* Pricing reference */}
                <div className="bg-muted/30 rounded-lg p-3 text-xs space-y-1 mt-2">
                  <p className="font-medium">💳 Send to lead:</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <a href="https://web-nine-zeta-27.vercel.app/pricing" target="_blank" rel="noopener" className="text-primary underline font-medium">Pricing Page ↗</a>
                    <span className="text-muted-foreground">$29 Single · $59 Bundle · $89 Full · $149 Lifetime</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
