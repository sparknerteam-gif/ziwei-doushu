"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Step = "interest" | "birth" | "events" | "contact" | "disclaimer" | "done";

interface LifeEventInput {
  what: string;
  when: string;
  cause: string;
  impact: string;
}

interface FormData {
  // Interest (hook)
  interestArea: string;
  // Birth
  birthDate: string;
  birthCity: string;
  birthTimeAccuracy: string;
  exactBirthTime: string;
  partOfDay: string;
  gender: string;
  // Events
  events: LifeEventInput[];
  // Contact
  email: string;
  socialHandle: string;
  // Disclaimer
  ageConfirm: boolean;
  disclaimerConfirm: boolean;
  dataConsent: boolean;
}

const initialFormData: FormData = {
  interestArea: "",
  birthDate: "",
  birthCity: "",
  birthTimeAccuracy: "",
  exactBirthTime: "",
  partOfDay: "",
  gender: "",
  events: [
    { what: "", when: "", cause: "", impact: "" },
    { what: "", when: "", cause: "", impact: "" },
  ],
  email: "",
  socialHandle: "",
  ageConfirm: false,
  disclaimerConfirm: false,
  dataConsent: false,
};

const inputCls = "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 outline-none";

const INTEREST_OPTIONS = [
  { value: "career", label: "💼 Life purpose / Career" },
  { value: "love", label: "💕 Love / Relationships" },
  { value: "wealth", label: "💰 Wealth / Money" },
  { value: "family", label: "🏠 Family / Roots" },
  { value: "health", label: "🧬 Health / Energy" },
  { value: "full", label: "🌐 Full picture — everything" },
];

export default function FormPage() {
  const [step, setStep] = useState<Step>("interest");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  const update = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const updateEvent = (idx: number, field: keyof LifeEventInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.map((e, i) => (i === idx ? { ...e, [field]: value } : e)),
    }));
  };

  const addEvent = () => {
    if (formData.events.length < 3) {
      setFormData((prev) => ({ ...prev, events: [...prev.events, { what: "", when: "", cause: "", impact: "" }] }));
    }
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validateStep = (targetStep: Step): boolean => {
    const errs: Record<string, string> = {};
    if (targetStep === "birth") {
      if (!formData.interestArea) errs.interestArea = "Please select an area of interest";
    }
    if (targetStep === "events") {
      if (!formData.birthDate) errs.birthDate = "Please select your birth date";
      if (!formData.birthCity) errs.birthCity = "Please enter your city and country";
      if (!formData.birthTimeAccuracy) errs.birthTimeAccuracy = "Please select how accurate your birth time is";
      if (!formData.gender) errs.gender = "Please select your gender";
      if (formData.birthTimeAccuracy === "exact" && !formData.exactBirthTime) errs.exactBirthTime = "Please enter your exact birth time";
    }
    if (targetStep === "contact") {
      const filledEvents = formData.events.filter(e => e.what.trim() && e.when.trim());
      if (filledEvents.length < 2) errs.events = "Please fill in at least 2 life events (WHAT + WHEN are the minimum)";
    }
    if (targetStep === "disclaimer") {
      if (!formData.email && !formData.socialHandle) errs.contact = "Please provide your email OR social handle (at least one)";
      if (formData.email && !EMAIL_RE.test(formData.email)) errs.email = "Please enter a valid email address";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const steps: { key: Step; label: string }[] = [
    { key: "interest", label: "Interest" },
    { key: "birth", label: "Birth Data" },
    { key: "events", label: "Life Events" },
    { key: "contact", label: "Contact" },
    { key: "disclaimer", label: "Confirm" },
  ];
  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">✦ Kismet</h1>
          <Badge variant="secondary" className="text-xs">Life Script Decoder</Badge>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* ── VALUE PROP (always visible) ── */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔮</div>
          <h2 className="text-2xl font-bold tracking-tight">Get Your Free Birth Chart Reading</h2>
          <p className="text-muted-foreground mt-2">
            Engine-computed 紫微斗數 analysis. Delivered to your DM within 48 hours.
            <br />
            <span className="text-sm">Free. Private. No payment required.</span>
          </p>
        </div>

        {/* Step indicator */}
        {step !== "done" && (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-3 font-medium">
              Step {currentIndex + 1} of {steps.length} — takes about 3 minutes
            </p>
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-2">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => i < currentIndex && setStep(s.key)}
                    className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center border transition-colors ${
                      i < currentIndex ? "bg-primary text-primary-foreground border-primary cursor-pointer"
                      : i === currentIndex ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {i < currentIndex ? "✓" : i + 1}
                  </button>
                  <span className={`text-xs hidden sm:inline ${i <= currentIndex ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: INTEREST (hook) ── */}
        {step === "interest" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">What brings you here?</h3>
            <p className="text-sm text-muted-foreground">This helps us tailor your reading to what matters most to you right now.</p>
            <div className="space-y-2">
              {INTEREST_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer py-3 px-4 rounded-lg border hover:border-primary/50 transition-colors">
                  <input
                    type="radio"
                    name="interestArea"
                    value={opt.value}
                    checked={formData.interestArea === opt.value}
                    onChange={(e) => update("interestArea", e.target.value)}
                    className="w-4 h-4 accent-primary shrink-0"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
            {fieldErrors.interestArea && <p className="text-xs text-destructive">{fieldErrors.interestArea}</p>}
            <div className="flex justify-end">
              <Button size="lg" onClick={() => { if (validateStep("birth")) setStep("birth"); }}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: BIRTH DATA ── */}
        {step === "birth" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">📍 Your Birth Coordinates</h3>
            <p className="text-sm text-muted-foreground">Your birth time is the most important factor for accuracy.</p>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Date of Birth <span className="text-destructive">*</span></Label>
              <Input id="birthDate" type="date" value={formData.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
              {fieldErrors.birthDate && <p className="text-xs text-destructive">{fieldErrors.birthDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthCity">City + Country <span className="text-destructive">*</span></Label>
              <Input id="birthCity" placeholder="e.g., London, UK" value={formData.birthCity} onChange={(e) => update("birthCity", e.target.value)} />
              {fieldErrors.birthCity && <p className="text-xs text-destructive">{fieldErrors.birthCity}</p>}
            </div>

            <div className="space-y-2">
              <Label>How accurate is your birth time? <span className="text-destructive">*</span></Label>
              <div className="space-y-2">
                {[
                  { value: "exact", label: "Exact (from birth certificate)" },
                  { value: "approximate", label: "Approximate (±30 min)" },
                  { value: "part", label: "Part of day only" },
                  { value: "unknown", label: "I don't know at all" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer py-1.5">
                    <input type="radio" name="birthTimeAccuracy" value={opt.value} checked={formData.birthTimeAccuracy === opt.value} onChange={(e) => update("birthTimeAccuracy", e.target.value)} className="w-4 h-4 accent-primary" />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.birthTimeAccuracy === "exact" && (
              <div className="space-y-2">
                <Label htmlFor="exactBirthTime">Exact Birth Time <span className="text-destructive">*</span></Label>
                <Input id="exactBirthTime" type="time" value={formData.exactBirthTime} onChange={(e) => update("exactBirthTime", e.target.value)} />
              </div>
            )}

            {(formData.birthTimeAccuracy === "part" || formData.birthTimeAccuracy === "approximate") && (
              <div className="space-y-2">
                <Label>Which part of the day?</Label>
                <div className="space-y-2">
                  {[
                    { value: "morning", label: "Morning (6am–12pm)" },
                    { value: "afternoon", label: "Afternoon (12pm–6pm)" },
                    { value: "evening", label: "Evening (6pm–12am)" },
                    { value: "night", label: "Night (12am–6am)" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer py-1.5">
                      <input type="radio" name="partOfDay" value={opt.value} checked={formData.partOfDay === opt.value} onChange={(e) => update("partOfDay", e.target.value)} className="w-4 h-4 accent-primary" />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Gender <span className="text-destructive">*</span></Label>
              <div className="flex gap-4">
                {["Male", "Female", "Other"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" value={opt} checked={formData.gender === opt} onChange={(e) => update("gender", e.target.value)} className="w-4 h-4 accent-primary" />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("interest")}>← Back</Button>
              <Button size="lg" onClick={() => { if (validateStep("events")) setStep("events"); }}>Continue →</Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: LIFE EVENTS (2 required, 1 optional) ── */}
        {step === "events" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold">🔍 Two Key Life Events</h3>
              <p className="text-sm text-muted-foreground mt-2">
                We use your past events to <strong>calibrate your chart</strong> — like GPS locking onto your coordinates.
                Be specific: what happened, when, why, and how it changed you.
              </p>
            </div>

            {formData.events.map((ev, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <span className="font-medium text-sm">Event {idx + 1} {idx < 2 ? "(required)" : "(optional)"}</span>

                <div className="space-y-2">
                  <Label>WHAT happened?</Label>
                  <textarea value={ev.what} onChange={(e) => updateEvent(idx, "what", e.target.value)} rows={2} placeholder={"e.g., 'I lost ~90% of my savings in crypto futures in 2023.'\ne.g., 'I was hospitalized for 7 days with a severe viral infection in May 2026.'"} className={`${inputCls} resize-y min-h-[50px]`} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>WHEN? (year + month)</Label>
                    <Input value={ev.when} onChange={(e) => updateEvent(idx, "when", e.target.value)} placeholder="e.g., 2023 November" />
                  </div>
                  <div className="space-y-2">
                    <Label>WHAT caused it?</Label>
                    <Input value={ev.cause} onChange={(e) => updateEvent(idx, "cause", e.target.value)} placeholder="e.g., over-leveraged trades" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>How did it IMPACT you?</Label>
                  <textarea value={ev.impact} onChange={(e) => updateEvent(idx, "impact", e.target.value)} rows={2} placeholder="How did this change your life, mindset, or direction?" className={`${inputCls} resize-y min-h-[50px]`} />
                </div>
              </div>
            ))}

            {formData.events.length < 3 && (
              <button onClick={addEvent} className="w-full py-2 border-2 border-dashed rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
                + Add Event {formData.events.length + 1} (improves accuracy)
              </button>
            )}

            {fieldErrors.events && <p className="text-xs text-destructive">{fieldErrors.events}</p>}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("birth")}>← Back</Button>
              <Button size="lg" onClick={() => { if (validateStep("contact")) setStep("contact"); }}>Continue →</Button>
            </div>
          </div>
        )}

        {/* ── STEP 4: CONTACT ── */}
        {step === "contact" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">📬 Where should we send your reading?</h3>
            <p className="text-sm text-muted-foreground">Just one is enough — email OR social handle.</p>

            <div className="space-y-2">
              <Label htmlFor="socialHandle">Reddit / Instagram / X handle</Label>
              <Input id="socialHandle" placeholder="e.g., u/yourname or @yourname" value={formData.socialHandle} onChange={(e) => update("socialHandle", e.target.value)} />
              <p className="text-xs text-muted-foreground">We'll DM you a preview here first.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => update("email", e.target.value)} />
            </div>

            {fieldErrors.contact && <p className="text-xs text-destructive">{fieldErrors.contact}</p>}
            {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("events")}>← Back</Button>
              <Button size="lg" onClick={() => { if (validateStep("disclaimer")) setStep("disclaimer"); }}>Continue →</Button>
            </div>
          </div>
        )}

        {/* ── STEP 5: DISCLAIMER (final, before submit) ── */}
        {step === "disclaimer" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Almost done — one last thing</h3>
            <p className="text-sm text-muted-foreground">A few quick confirmations before we generate your reading.</p>

            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-semibold text-destructive">⚠️ Please confirm:</p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.ageConfirm} onChange={(e) => update("ageConfirm", e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary" />
                <span>I am <strong>18 years or older</strong></span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.disclaimerConfirm} onChange={(e) => update("disclaimerConfirm", e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary" />
                <span>I understand this is for <strong>entertainment and self-reflection only</strong>, not professional medical, legal, or financial advice</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.dataConsent} onChange={(e) => update("dataConsent", e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary" />
                <span>I consent to my data being used for chart analysis. It will <strong>never</strong> be shared or sold.</span>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("contact")}>← Back</Button>
              <Button
                size="lg"
                disabled={submitting || !formData.ageConfirm || !formData.disclaimerConfirm || !formData.dataConsent}
                onClick={async () => {
                  setSubmitting(true);
                  setError("");
                  try {
                    const payload = {
                      interestArea: formData.interestArea,
                      birthDate: formData.birthDate,
                      birthCity: formData.birthCity,
                      birthTimeAccuracy: formData.birthTimeAccuracy,
                      exactBirthTime: formData.exactBirthTime || null,
                      partOfDay: formData.partOfDay || null,
                      gender: formData.gender,
                      lifeEvent1: formData.events[0]?.what ? `${formData.events[0].what} | WHEN: ${formData.events[0].when} | CAUSE: ${formData.events[0].cause} | IMPACT: ${formData.events[0].impact}` : "",
                      lifeEvent2: formData.events[1]?.what ? `${formData.events[1].what} | WHEN: ${formData.events[1].when} | CAUSE: ${formData.events[1].cause} | IMPACT: ${formData.events[1].impact}` : null,
                      lifeEvent3: formData.events[2]?.what ? `${formData.events[2].what} | WHEN: ${formData.events[2].when} | CAUSE: ${formData.events[2].cause} | IMPACT: ${formData.events[2].impact}` : null,
                      email: formData.email || null,
                      socialHandle: formData.socialHandle || "",
                      submittedAt: new Date().toISOString(),
                    };
                    const res = await fetch("/api/submit-form", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) throw new Error("Failed to submit");

                    try {
                      const existingRaw = localStorage.getItem("kismet-local-submissions");
                      const existing = existingRaw ? JSON.parse(existingRaw) : [];
                      existing.push(payload);
                      localStorage.setItem("kismet-local-submissions", JSON.stringify(existing));
                    } catch {}

                    setStep("done");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {submitting ? "Submitting..." : "Get My Free Reading →"}
              </Button>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">⚠ {error}</p>}
          </div>
        )}

        {/* ── DONE ── */}
        {step === "done" && (
          <div className="text-center py-10 sm:py-16 space-y-6">
            <div className="text-6xl">✦</div>
            <h2 className="text-2xl font-bold">Your data has been received.</h2>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              We'll analyze your birth chart and send you a <strong>free calibration preview</strong> within <strong>48 hours</strong>.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 max-w-md mx-auto text-left space-y-3">
              <p className="font-semibold text-sm">📬 Check your DMs</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your first touch-point will be a direct message to your social handle or email. We reach out within 2 days.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t mt-auto py-4 text-center text-xs text-muted-foreground">
        Kismet — Life Script Decoder. For guidance and self-reflection only.
      </footer>
    </div>
  );
}
