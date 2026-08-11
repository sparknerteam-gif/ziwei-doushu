"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Step = "disclaimer" | "birth" | "event" | "contact" | "optional" | "done";

interface FormData {
  // Disclaimer
  ageConfirm: boolean;
  disclaimerConfirm: boolean;
  dataConsent: boolean;
  // Birth
  birthDate: string;
  birthCity: string;
  birthTimeAccuracy: string;
  exactBirthTime: string;
  partOfDay: string;
  gender: string;
  // Event
  lifeEvent1: string;
  // Contact
  email: string;
  socialHandle: string;
  interestArea: string;
  // Optional
  lifeEvent2: string;
  lifeEvent3: string;
  siblings: string;
  physical: string;
  mbti: string;
  anythingElse: string;
}

const initialFormData: FormData = {
  ageConfirm: false,
  disclaimerConfirm: false,
  dataConsent: false,
  birthDate: "",
  birthCity: "",
  birthTimeAccuracy: "",
  exactBirthTime: "",
  partOfDay: "",
  gender: "",
  lifeEvent1: "",
  email: "",
  socialHandle: "",
  interestArea: "",
  lifeEvent2: "",
  lifeEvent3: "",
  siblings: "",
  physical: "",
  mbti: "",
  anythingElse: "",
};

export default function FormPage() {
  const [step, setStep] = useState<Step>("disclaimer");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const update = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    // Clear field error when user edits
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validateStep = (targetStep: Step): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (targetStep === "birth") {
      if (!formData.birthDate) errs.birthDate = "Please select your birth date";
      if (!formData.birthCity) errs.birthCity = "Please enter your city and country of birth";
      if (!formData.birthTimeAccuracy) errs.birthTimeAccuracy = "Please select how accurate your birth time is";
      if (!formData.gender) errs.gender = "Please select your gender";
      if (formData.birthTimeAccuracy === "exact" && !formData.exactBirthTime) {
        errs.exactBirthTime = "Please enter your exact birth time";
      }
    }
    if (targetStep === "event") {
      if (formData.lifeEvent1.trim().length < 20) {
        errs.lifeEvent1 = "Be specific about what happened and when. Vague answers make calibration impossible.";
      }
    }
    if (targetStep === "contact") {
      if (!formData.email) errs.email = "Please enter your email address";
      else if (!EMAIL_RE.test(formData.email)) errs.email = "Please enter a valid email address (e.g. you@example.com)";
      if (!formData.socialHandle) errs.socialHandle = "Please enter your Reddit, Instagram, or Twitter handle";
      if (!formData.interestArea) errs.interestArea = "Please select an area of interest";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const canProceedDisclaimer = formData.ageConfirm && formData.disclaimerConfirm && formData.dataConsent;
  const canProceedBirth = formData.birthDate && formData.birthCity && formData.birthTimeAccuracy && formData.gender;
  const canProceedEvent = formData.lifeEvent1.trim().length >= 20;
  const canProceedContact = formData.email && EMAIL_RE.test(formData.email) && formData.socialHandle && formData.interestArea;

  // ── UTILITY: apply error class to field wrappers ──
  const fel = (field: keyof FormData) =>
    fieldErrors[field] ? "border-destructive/50 focus-visible:border-destructive focus-visible:ring-destructive/30" : "";

  // ── STEP INDICATOR ──
  const steps: { key: Step; label: string }[] = [
    { key: "disclaimer", label: "Disclaimer" },
    { key: "birth", label: "Birth Data" },
    { key: "event", label: "Life Event" },
    { key: "contact", label: "Contact" },
    { key: "optional", label: "Optional" },
  ];
  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">✦ Kismet</h1>
            <Badge variant="secondary" className="text-xs">
              Life Script Decoder
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Step indicator */}
        {step !== "done" && (
          <div className="mb-8">
            <p className="text-xs text-muted-foreground mb-3 font-medium">
              Step {currentIndex + 1} of {steps.length}
            </p>
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-2">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => i < currentIndex && setStep(s.key)}
                    className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center border transition-colors ${
                      i < currentIndex
                        ? "bg-primary text-primary-foreground border-primary cursor-pointer"
                        : i === currentIndex
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {i < currentIndex ? "✓" : i + 1}
                  </button>
                  <span
                    className={`text-xs hidden sm:inline ${
                      i <= currentIndex ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* STEP 1: DISCLAIMER */}
        {/* ───────────────────────────────────────────── */}
        {step === "disclaimer" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Before You Begin</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Kismet is a life script pattern analysis service for <strong>entertainment and self-reflection</strong> purposes only.
              </p>
            </div>

            <div className="space-y-3 text-sm leading-relaxed">
              {/* Critical warnings — high visibility */}
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-2">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive shrink-0 mt-0.5">&#x26A0;</span>
                    <span>This is <strong className="text-destructive">NOT</strong> medical, legal, financial, or psychological advice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive shrink-0 mt-0.5">&#x26A0;</span>
                    <span>Kismet does <strong className="text-destructive">NOT</strong> predict death, illness, or specific tragedies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive shrink-0 mt-0.5">&#x26A0;</span>
                    <span>Kismet does <strong className="text-destructive">NOT</strong> replace professional mental health support</span>
                  </li>
                </ul>
              </div>

              {/* Secondary notices — muted */}
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="mb-2 text-foreground font-medium">By proceeding, you also acknowledge:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">&#x25C9;</span>
                    <span>Results are <strong>pattern-based interpretations</strong>, not guaranteed facts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">&#x25C9;</span>
                    <span>Your data is <strong>never</strong> shared, sold, or used for any other purpose</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">&#x25C9;</span>
                    <span>You must be <strong>18 years or older</strong> to use this service</span>
                  </li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="space-y-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ageConfirm}
                  onChange={(e) => update("ageConfirm", e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary shrink-0"
                />
                <span className="text-sm">I confirm I am <strong>18 years of age or older</strong></span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.disclaimerConfirm}
                  onChange={(e) => update("disclaimerConfirm", e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary shrink-0"
                />
                <span className="text-sm">I understand this service is for <strong>entertainment and self-reflection only</strong>, and does not constitute professional advice of any kind</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.dataConsent}
                  onChange={(e) => update("dataConsent", e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary shrink-0"
                />
                <span className="text-sm">I consent to my birth data being used for chart analysis. My data will <strong>not</strong> be shared or sold.</span>
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                disabled={!canProceedDisclaimer}
                onClick={() => {
                  if (canProceedDisclaimer) setStep("birth");
                }}
                size="lg"
              >
                Agree &amp; Continue &#x2192;
              </Button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* STEP 2: BIRTH DATA */}
        {/* ───────────────────────────────────────────── */}
        {step === "birth" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">📍 Your Birth Coordinates</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your birth time is <strong>THE most important factor</strong> for accuracy. If possible, check your birth certificate first.
              </p>
            </div>

            {/* Q1: Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate">Date of Birth <span className="text-destructive">*</span></Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => update("birthDate", e.target.value)}
                className={fel("birthDate")}
              />
              {fieldErrors.birthDate && (
                <p className="text-xs text-destructive">{fieldErrors.birthDate}</p>
              )}
            </div>

            {/* Q2: Birth City */}
            <div className="space-y-2">
              <Label htmlFor="birthCity">City + Country of Birth <span className="text-destructive">*</span></Label>
              <Input
                id="birthCity"
                placeholder="e.g. London, UK or New York City, USA"
                value={formData.birthCity}
                onChange={(e) => update("birthCity", e.target.value)}
                className={fel("birthCity")}
              />
              {fieldErrors.birthCity ? (
                <p className="text-xs text-destructive">{fieldErrors.birthCity}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Used to calculate your true solar time — the actual position of the sun at your birth.</p>
              )}
            </div>

            {/* Q3: Birth Time Accuracy */}
            <div className="space-y-2">
              <Label>How accurate is your birth time? <span className="text-destructive">*</span></Label>
              <div className={`space-y-2 ${fieldErrors.birthTimeAccuracy ? "border border-destructive/50 rounded-lg p-3" : ""}`}>
                {[
                  { value: "exact", label: "Exact (from birth certificate or hospital records)" },
                  { value: "approximate", label: "Approximate (±30 minutes)" },
                  { value: "part", label: "Part of day only (morning / afternoon / evening / night)" },
                  { value: "unknown", label: "I don't know my birth time at all" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer py-1.5">
                    <input
                      type="radio"
                      name="birthTimeAccuracy"
                      value={opt.value}
                      checked={formData.birthTimeAccuracy === opt.value}
                      onChange={(e) => update("birthTimeAccuracy", e.target.value)}
                      className="w-4 h-4 accent-primary shrink-0"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.birthTimeAccuracy ? (
                <p className="text-xs text-destructive">{fieldErrors.birthTimeAccuracy}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  This determines how precisely we can calibrate your chart. &quot;Exact&quot; gives the best results.
                </p>
              )}
            </div>

            {/* Q4: Exact Time — only if exact selected */}
            {formData.birthTimeAccuracy === "exact" && (
              <div className="space-y-2">
                <Label htmlFor="exactBirthTime">Exact Birth Time <span className="text-destructive">*</span></Label>
                <Input
                  id="exactBirthTime"
                  type="time"
                  value={formData.exactBirthTime}
                  onChange={(e) => update("exactBirthTime", e.target.value)}
                  className={fel("exactBirthTime")}
                />
                {fieldErrors.exactBirthTime && (
                  <p className="text-xs text-destructive">{fieldErrors.exactBirthTime}</p>
                )}
              </div>
            )}

            {/* Q5: Part of day — only if part selected */}
            {(formData.birthTimeAccuracy === "part" || formData.birthTimeAccuracy === "approximate" || formData.birthTimeAccuracy === "unknown") && (
              <div className="space-y-2">
                <Label>Which part of the day were you born?</Label>
                <div className="space-y-2">
                  {[
                    { value: "morning", label: "Morning (6am – 12pm)" },
                    { value: "afternoon", label: "Afternoon (12pm – 6pm)" },
                    { value: "evening", label: "Evening (6pm – 12am)" },
                    { value: "night", label: "Night (12am – 6am)" },
                    { value: "unknown_part", label: "I really don't know" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer py-1.5">
                      <input
                        type="radio"
                        name="partOfDay"
                        value={opt.value}
                        checked={formData.partOfDay === opt.value}
                        onChange={(e) => update("partOfDay", e.target.value)}
                        className="w-4 h-4 accent-primary shrink-0"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Q6: Gender */}
            <div className="space-y-2">
              <Label>Gender <span className="text-destructive">*</span></Label>
              <div className={`flex flex-wrap gap-4 ${fieldErrors.gender ? "border border-destructive/50 rounded-lg p-3" : ""}`}>
                {["Male", "Female", "Other / Prefer not to say"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={opt}
                      checked={formData.gender === opt}
                      onChange={(e) => update("gender", e.target.value)}
                      className="w-4 h-4 accent-primary shrink-0"
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.gender && (
                <p className="text-xs text-destructive">{fieldErrors.gender}</p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("disclaimer")} size="lg">
                ← Back
              </Button>
              <Button
                onClick={() => {
                  if (validateStep("birth")) setStep("event");
                }}
                size="lg"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* STEP 3: LIFE EVENT */}
        {/* ───────────────────────────────────────────── */}
        {step === "event" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">🔍 One Key Event — Your Calibration Anchor</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We use past life events to <strong>verify your birth chart</strong> — like a GPS locking onto your coordinates. The more specific you are, the more accurate the result.
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-2">
              <p><strong>✅ Good example:</strong></p>
              <p className="text-muted-foreground italic pl-3 border-l-2 border-green-500/50">
                &ldquo;I lost roughly 90% of my savings (~$40K) in cryptocurrency during the 2023 crash. I had to move back in with my parents and it took me over a year to recover psychologically.&rdquo;
              </p>
              <p className="mt-3"><strong>❌ Bad example:</strong></p>
              <p className="text-muted-foreground italic pl-3 border-l-2 border-destructive/50">
                &ldquo;I had money problems.&rdquo;
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifeEvent1">Your Major Life Event <span className="text-destructive">*</span></Label>
              <textarea
                id="lifeEvent1"
                rows={5}
                placeholder="Tell us WHAT happened, WHEN it happened, and HOW it impacted you..."
                value={formData.lifeEvent1}
                onChange={(e) => update("lifeEvent1", e.target.value)}
                className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-y min-h-[120px] ${
                  fieldErrors.lifeEvent1
                    ? "border-destructive/50 focus-visible:border-destructive focus-visible:ring-destructive/30"
                    : "border-input"
                }`}
              />
              {fieldErrors.lifeEvent1 ? (
                <p className="text-xs text-destructive">{fieldErrors.lifeEvent1}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Be specific: year + what happened + impact on you. Minimum 20 characters.
                </p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("birth")} size="lg">
                ← Back
              </Button>
              <Button
                onClick={() => {
                  if (validateStep("event")) setStep("contact");
                }}
                size="lg"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* STEP 4: CONTACT + INTEREST */}
        {/* ───────────────────────────────────────────── */}
        {step === "contact" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">📬 Where Should We Send Your Reading?</h2>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
                className={fel("email")}
              />
              {fieldErrors.email ? (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Your reading will be sent here. No spam, ever.</p>
              )}
            </div>

            {/* Social Handle */}
            <div className="space-y-2">
              <Label htmlFor="socialHandle">Reddit / Instagram / Twitter Handle <span className="text-destructive">*</span></Label>
              <Input
                id="socialHandle"
                placeholder="e.g. u/yourname or @yourname"
                value={formData.socialHandle}
                onChange={(e) => update("socialHandle", e.target.value)}
                className={fel("socialHandle")}
              />
              {fieldErrors.socialHandle ? (
                <p className="text-xs text-destructive">{fieldErrors.socialHandle}</p>
              ) : (
                <p className="text-xs text-muted-foreground">We&apos;ll DM you a preview. If you found us through Reddit, use your Reddit username.</p>
              )}
            </div>

            {/* Interest Area */}
            <div className="space-y-2">
              <Label>What area of life interests you most right now? <span className="text-destructive">*</span></Label>
              <div className={`space-y-2 ${fieldErrors.interestArea ? "border border-destructive/50 rounded-lg p-3" : ""}`}>
                {[
                  { value: "career", label: "💼 Life purpose / Career direction" },
                  { value: "love", label: "💕 Relationships / Love / Partnership" },
                  { value: "wealth", label: "💰 Wealth / Money / Financial patterns" },
                  { value: "family", label: "🏠 Family / Childhood / Origin wounds" },
                  { value: "health", label: "🧬 Health / Body / Energy patterns" },
                  { value: "full", label: "🌐 I want the full picture — all of the above" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer py-1.5">
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
              {fieldErrors.interestArea && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.interestArea}</p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("event")} size="lg">
                ← Back
              </Button>
              <Button
                onClick={() => {
                  if (validateStep("contact")) setStep("optional");
                }}
                size="lg"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* STEP 5: OPTIONAL */}
        {/* ───────────────────────────────────────────── */}
        {step === "optional" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">🔓 Optional: Sharper Calibration</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                These questions are <strong>optional</strong>, but each one you answer significantly improves accuracy. Every detail helps narrow your exact birth chart from 12 possibilities down to 1.
              </p>
            </div>

            {/* More life events */}
            <div className="space-y-2">
              <Label htmlFor="lifeEvent2">More Life Events (optional)</Label>
              <textarea
                id="lifeEvent2"
                rows={3}
                placeholder="Another major event: year + what happened + impact"
                value={formData.lifeEvent2}
                onChange={(e) => update("lifeEvent2", e.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-y min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <textarea
                id="lifeEvent3"
                rows={3}
                placeholder="One more event (if applicable)"
                value={formData.lifeEvent3}
                onChange={(e) => update("lifeEvent3", e.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-y min-h-[80px]"
              />
            </div>

            {/* Siblings */}
            <div className="space-y-2">
              <Label htmlFor="siblings">Siblings (optional)</Label>
              <Input
                id="siblings"
                placeholder="e.g. One older brother (3 years older), one younger sister (2 years younger)"
                value={formData.siblings}
                onChange={(e) => update("siblings", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Count, birth order, and age gaps help verify your family palace.</p>
            </div>

            {/* Physical */}
            <div className="space-y-2">
              <Label htmlFor="physical">Physical Description (optional)</Label>
              <Input
                id="physical"
                placeholder="e.g. 6ft 1in, lean build, sharp jawline, intense eyes"
                value={formData.physical}
                onChange={(e) => update("physical", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Brief description: height, build, distinctive features.</p>
            </div>

            {/* MBTI */}
            <div className="space-y-2">
              <Label>MBTI Type (optional)</Label>
              <select
                value={formData.mbti}
                onChange={(e) => update("mbti", e.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
              >
                <option value="">Select your type (if known)</option>
                <option value="INTJ">INTJ</option>
                <option value="INTP">INTP</option>
                <option value="ENTJ">ENTJ</option>
                <option value="ENTP">ENTP</option>
                <option value="INFJ">INFJ</option>
                <option value="INFP">INFP</option>
                <option value="ENFJ">ENFJ</option>
                <option value="ENFP">ENFP</option>
                <option value="ISTJ">ISTJ</option>
                <option value="ISFJ">ISFJ</option>
                <option value="ESTJ">ESTJ</option>
                <option value="ESFJ">ESFJ</option>
                <option value="ISTP">ISTP</option>
                <option value="ISFP">ISFP</option>
                <option value="ESTP">ESTP</option>
                <option value="ESFP">ESFP</option>
                <option value="unknown">I don't know my MBTI type</option>
              </select>
            </div>

            {/* Anything else */}
            <div className="space-y-2">
              <Label htmlFor="anythingElse">Anything else you want us to know? (optional)</Label>
              <textarea
                id="anythingElse"
                rows={3}
                placeholder="Any context, questions, or things on your mind that might help us understand your situation better."
                value={formData.anythingElse}
                onChange={(e) => update("anythingElse", e.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-y min-h-[80px]"
              />
            </div>

            <Separator />

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("contact")} size="lg">
                ← Back
              </Button>
              <Button
                size="lg"
                onClick={async () => {
                  setSubmitting(true);
                  setError("");
                  try {
                    const payload = {
                      ...formData,
                      submittedAt: new Date().toISOString(),
                    };
                    // POST to the API route
                    const res = await fetch("/api/submit-form", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) throw new Error("Failed to submit");

                    // ── Bonus: Cache submission client-side ──
                    // Store in localStorage so the dashboard can show it
                    // immediately even if the serverless instance cold-starts.
                    try {
                      const existingRaw = localStorage.getItem("kismet-local-submissions");
                      const existing = existingRaw ? JSON.parse(existingRaw) : [];
                      const submission = {
                        ...payload,
                        // Ensure required fields have defaults matching the API shape
                        lifeEvent2: payload.lifeEvent2 || null,
                        lifeEvent3: payload.lifeEvent3 || null,
                        siblings: payload.siblings || null,
                        physical: payload.physical || null,
                        mbti: payload.mbti || null,
                        anythingElse: payload.anythingElse || null,
                      };
                      existing.push(submission);
                      localStorage.setItem("kismet-local-submissions", JSON.stringify(existing));
                    } catch {
                      // localStorage might be unavailable (private browsing, quota)
                    }

                    setStep("done");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit →"}
              </Button>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">⚠ {error}</p>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* DONE */}
        {/* ───────────────────────────────────────────── */}
        {step === "done" && (
          <div className="text-center py-10 sm:py-16 space-y-6">
            <div className="text-6xl">✦</div>
            <h2 className="text-2xl font-bold">Your data has been received.</h2>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              We will analyze your birth chart and send you a <strong>free calibration preview</strong> within <strong>48 hours</strong>.
            </p>

            {/* DM callout — critical for Reddit leads */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 max-w-md mx-auto text-left space-y-3">
              <p className="font-semibold text-sm">Important: Check your DMs</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your first touch-point will be a <strong>direct message</strong> to your social handle
                {formData.socialHandle ? (
                  <span> (<code className="bg-muted px-1 py-0.5 rounded text-xs">{formData.socialHandle}</code>)</span>
                ) : null}.
                We reach out via DM <em>before</em> email, so keep an eye on your message requests / inbox within the next 2 days.
              </p>
              <p className="text-xs text-muted-foreground">
                If you don&apos;t hear from us within 48 hours, check your spam folder or DM us directly.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              — Kismet &middot; Life Script Decoder
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto py-4 text-center text-xs text-muted-foreground">
        Kismet — Life Script Decoder. For guidance and self-reflection only.
      </footer>
    </div>
  );
}
