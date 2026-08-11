# Kismet — Complete Operational Pipeline

> **Version**: 1.0 — MVP Launch  
> **Last Updated**: 2026-08-11  
> **Owner**: Hugo  

---

## Overview

Kismet delivers AI-powered birth chart readings to the Western market. This document covers the complete end-to-end workflow: from finding a lead on Reddit to delivering a paid reading.

```
LEAD DISCOVERY  →  FORM SUBMISSION  →  CALIBRATION  →  DM DELIVERY  →  PAID CONVERSION
    (Reddit)        (Google Form)      (Claude AI)     (Reddit/IG)      (Stripe)
```

---

## Stage 0: Pre-Launch Checklist

Before finding your first lead, make sure:

- [x] Google Form is live and tested
- [x] kismet-engine.md agent definition is ready
- [x] Stripe account is set up with payment link
- [ ] Reddit account with enough karma to DM
- [ ] First Reddit "case study" post is written
- [ ] DM templates ready for each cognitive type

---

## Stage 1: Lead Discovery (Reddit Battlefield)

### Target Subreddits

| Subreddit | Size | Why | Post Type |
|-----------|------|-----|-----------|
| r/astrology | ~1.5M | Astrology-curious, open to fate systems | Case study post |
| r/Jung | ~200K | Depth psychology, shadow work, archetypes | Analytical post |
| r/MBTI | ~300K | Cognitive typing obsessed, INTJ/INFJ heavy | MBTI x chart cross-analysis |
| r/INTJ | ~100K | Hugo's native tribe, loves systems thinking | Personal journey post |
| r/selfimprovement | ~1.5M | People actively trying to fix their lives | Transformation story |
| r/findapath | ~500K | Lost career-wise, prime for career reading | Career direction angle |

### Reddit Account Setup

1. **Account Age**: Need account with at least 30 days + 100 karma to DM effectively
2. **Profile**: Clean. No spam history. A few genuine comments in target subs.
3. **Avatar**: Default or neutral. No anime/edgelord.
4. **Bio**: Something subtle like "systems thinker. life script decoder." — no links, no self-promo.

### How to Find Leads (Manual — MVP)

Spend 30-60 min/day scanning these subreddits. Sort by "New". Look for keywords:

**High-Intent Keywords:**
- "lost everything" / "ruined my life" / "hit rock bottom"
- "existential crisis" / "what's the point" / "nothing makes sense"
- "lost all my money" / "broke" / "financial ruin"
- "broke up" / "heartbroken" / "can't get over"
- "stuck in life" / "no direction" / "don't know what to do"
- "career change" / "quit my job" / "hate my job"
- "family trauma" / "toxic parents" / "cut off family"
- "feel like a failure" / "everyone's ahead of me"

**When you find a post**: Do NOT immediately DM. First, leave a genuine, helpful comment (2-3 sentences). Wait a few hours. THEN send DM.

### Daily Reddit Routine

| Time | Action | Duration |
|------|--------|----------|
| Morning (9-10am HKT) | Scan all 6 subreddits, leave 5-10 helpful comments | 1 hr |
| Afternoon (2-3pm HKT) | Check replies, send 3-5 calibrated DMs | 1 hr |
| Evening (9-10pm HKT) | Process any new form submissions, send readings | 1 hr |

Total: **3 hours/day**

---

## Stage 2: Google Form — Lead Capture

### Form URL
**[INSERT YOUR GOOGLE FORM LINK HERE]**

### Form Structure (6 Required + 7 Optional = 13 total)

#### Page 1: Disclaimer + Consent (REQUIRED)

```
╔══════════════════════════════════════════════════════╗
║  KISMET — LIFE SCRIPT DECODER                       ║
║                                                      ║
║  IMPORTANT DISCLAIMER                                ║
║                                                      ║
║  This service is for ENTERTAINMENT and               ║
║  SELF-REFLECTION purposes only.                      ║
║                                                      ║
║  Kismet does NOT:                                    ║
║  • Provide medical, legal, or financial advice       ║
║  • Predict death, illness, or specific tragedies     ║
║  • Replace professional mental health support        ║
║  • Guarantee 100% accuracy of any reading            ║
║                                                      ║
║  What Kismet DOES:                                   ║
║  • Analyze patterns in your birth data               ║
║  • Offer frameworks for self-understanding           ║
║  • Provide perspective based on ancient pattern      ║
║    recognition systems                               ║
║                                                      ║
║  By submitting this form, you acknowledge:           ║
║  ☐ I am 18+ years old                               ║
║  ☐ I understand this is for entertainment and       ║
║    self-reflection only                              ║
║  ☐ I consent to my data being used for analysis     ║
║    (your data is never shared or sold)               ║
║                                                      ║
║                       [NEXT →]                       ║
╚══════════════════════════════════════════════════════╝
```

#### Page 2: Birth Data (REQUIRED)

| # | Question | Type | Why |
|---|----------|------|-----|
| Q1 | **Date of Birth** (DD/MM/YYYY) | Date picker | Primary chart input |
| Q2 | **City + Country of Birth** | Short text | True solar time correction via longitude |
| Q3 | **Birth Time** | Multiple choice | Determines case routing |
| | Options: | | |
| | • Exact (from birth certificate) | | Case A — direct calibration |
| | • Approximate (±30 min) | | Case B — narrow to 2-4 charts |
| | • Part of day (morning/afternoon/evening/night) | | Case B/C |
| | • Unknown | | Case C — 12-chart sweep |
| Q4 | **Exact Birth Time** (if known) | Time (HH:MM) | Only shown if Q3 = Exact |
| Q5 | **Gender** (M/F/Other) | Multiple choice | Decade cycle direction, chart calculation |

**Q3 Explanation text**: "Your birth time is the single most important factor in chart accuracy. Check your birth certificate if possible. Without an accurate time, we can only provide a partial reading."

#### Page 3: Life Events — Calibration Data (REQUIRED)

| # | Question | Type | Why |
|---|----------|------|-----|
| Q6 | **One Major Life Event** | Paragraph | The anchor for birth time verification |
| | *(year + what happened + impact)* | | |
| | *Example: "I lost ~90% of my crypto savings in 2023 during the crash. It took me a year to recover mentally."* | | |
| | *Bad example: "I had money problems."* | | |

#### Page 4: Contact + Interest (REQUIRED)

| # | Question | Type | Why |
|---|----------|------|-----|
| Q7 | **Email Address** | Email | Delivery of reading |
| Q8 | **Reddit / IG / Twitter Handle** | Short text | DM delivery (preferred) |
| Q9 | **What area interests you most?** | Multiple choice | Determines what to pitch |
| | • Life purpose / Career direction | | |
| | • Relationships / Love | | |
| | • Wealth / Financial patterns | | |
| | • Family / Origin wounds | | |
| | • Health / Body patterns | | |
| | • All of the above | | |

#### Page 5: Optional — Better Calibration (OPTIONAL)

| # | Question | Type | Why |
|---|----------|------|-----|
| Q10 | Up to 2 more life events | Paragraph | More data = higher confidence |
| Q11 | Siblings? (count + birth order + age gaps) | Short text | 兄弟宮 verification |
| Q12 | Your body type / build / defining features | Short text | Physical pattern matching |
| Q13 | Your MBTI type (if known) | Multiple choice | Cognitive profile for DM script |

Mark this page clearly: **"Optional — but the more you share, the more accurate your reading."**

---

## Stage 3: Calibration (Claude AI — kismet-engine)

### When a Form is Submitted

1. Hugo receives Google Form email notification
2. Open Claude, invoke kismet-engine: "Calibrate this lead: [PASTE FORM DATA]"
3. Claude runs 4-phase calibration:
   - **Phase 1**: Classify (Case A/B/C based on Q3)
   - **Phase 2**: Generate chart(s) via kismet-core engine
   - **Phase 3**: Cross-match events → score → lock birth hour
   - **Phase 4**: (If needed) Pattern matching for Case C
4. Claude outputs:
   - **Output A**: Internal Calibration Report (Hugo reads)
   - **Output B**: DM Script (Hugo copy-pastes to lead)
   - **Output C**: Clarifying Questions (if confidence < 70%)

### Confidence Thresholds

| Confidence | Action |
|------------|--------|
| ≥ 85% | Send DM Script directly |
| 70-84% | Send DM Script, flag as "moderate confidence" |
| < 70% | Send Clarifying Questions first, wait for reply, re-calibrate |

### DM Script Strategy by Cognitive Type

| Type | Style | Opening Hook | Bridge |
|------|-------|-------------|--------|
| **NT** (INTJ/INTP/ENTJ/ENTP) | Data-driven, logical | "The algorithm has locked your birth coordinates. Here's the verification." | "That was calibration. The full architecture exists." |
| **NF** (INFJ/INFP/ENFJ/ENFP) | Archetype, shadow work | "I decoded your birth chart. One pattern stood out — and you've probably felt it your entire life without being able to name it." | "That's just the surface. Your full blueprint reveals something deeper." |
| **SJ** (ISTJ/ESTJ/ISFJ/ESFJ) | Practical, concrete | "According to your birth data analysis, here's a verified pattern from your past. See if this matches." | "If this verification is accurate, the rest of the data may be relevant to your situation." |
| **SP** (ESFP/ESTP/ISFP/ISTP) | High-impact, short | "I found something in your birth code that doesn't make sense — unless it's right." | "One data point is interesting. The full picture changes everything." |
| **Unknown** | Neutral, curious | "I analyzed your birth data. One specific thing stood out — let me know if this resonates." | "If this hits, there's more where it came from." |

### DM Script Structure (Every DM)

```
[CONTEXT]: Why you're reaching out
[SHOCK VERIFICATION]: One specific, falsifiable statement about their past
[BRIDGE]: Transition from calibration → full architecture
[SOFT TRANSITION]: Low-pressure mention of paid options
[OPEN DOOR]: Leave the ball in their court, no pressure
```

**IMPORTANT RULES:**
- Never send DM immediately after commenting. Wait 2-12 hours.
- Never DM someone who hasn't posted recently (check post date).
- Never send the same DM to two people. Each must be personalized.
- Never mention "Kismet" in first DM. You're just a person who's into systems thinking.
- Never use the word "astrology" or "fortune telling." Use "pattern analysis" or "life script decoding."

---

## Stage 4: DM Delivery + Follow-up

### DM Delivery Flow

1. Hugo copy-pastes Output B from Claude
2. Hugo personalizes: adds lead's name, references their specific post
3. Send via Reddit DM (or IG/Twitter if provided)
4. Log in tracking spreadsheet

### DM Tracking Spreadsheet (Google Sheets)

| Column | Example |
|--------|---------|
| Date | 2026-08-11 |
| Lead Name/Handle | u/throwaway_stuck |
| Source | r/findapath |
| Form Submitted? | ✅ |
| Calibration Confidence | 85% |
| DM Sent? | ✅ |
| DM Opened? | ⏳ |
| Lead Replied? | ⏳ |
| Calibration Verified? | ⏳ |
| Interest Area | Career |
| Paid Tier Pitched | Full Architecture ($149) |
| Converted? | ⏳ |
| Notes | |

### Follow-up Sequence

| Timing | Action |
|--------|--------|
| Day 0 | Send initial DM with shock verification |
| Day 2 | If no reply: "Hey, just checking if you saw this. No pressure either way." |
| Day 7 | If no reply: Final gentle nudge. "Last message — if you're ever curious about what your birth data reveals, the door's open." |
| Day 30 | If no reply: Archive. Do not message again. |

**Never chase more than 3 times.** Desperation kills perceived value.

---

## Stage 5: Paid Conversion

### Pricing Tiers

| Tier | Price | What's Included | When to Pitch |
|------|-------|----------------|---------------|
| **Core Archetype Scan** | Free | One specific past event verification | Initial DM |
| **Single Domain Deep Dive** | $49-79 | One life area (Career, Love, Wealth, Family, Health) — full analysis with timeline | After they verify the free calibration |
| **Full Architecture** | $149-199 | All 5 domains, 12-palace analysis, Chaos/Leverage Windows, Dual-Ending Strategy | After they show strong interest |
| **1-on-1 Consultation** | $299+ | Live session with Hugo, personalized debrief | Only for high-trust repeat clients |

### Payment Flow

1. Lead says they want the full reading
2. Hugo sends Stripe Payment Link: **[INSERT STRIPE LINK]**
3. Lead pays → Hugo receives notification
4. Hugo runs full kismet-engine deep dive
5. Deliver as a well-formatted document (Google Doc or Notion page)
6. Follow up 3 days later: "Any questions about your reading?"

### Delivery Format (Paid Reading)

Deliver as a Google Doc with:

```
KISMET LIFE SCRIPT DECODE
For: [Name] | Date: [Today]

1. VERIFIED CALIBRATION
   - Your locked birth time: [时辰]
   - Event match verification (the proof)

2. CORE ARCHETYPE
   - Your Ming Palace: [stars + English archetype]
   - Your Shen Palace: [stars + English archetype]
   - Your Element + MBTI Mapping

3. THE FIVE DOMAINS
   - Destiny/Career (命宫 + 事業宫)
   - Love/Relationships (夫妻宮)
   - Wealth (財帛宮)
   - Family/Origin (父母宮 + 兄弟宮)
   - Health/Body (疾厄宮)

4. TEMPORAL MAP
   - Current Decade Cycle (大限)
   - Chaos Windows (periods of highest disruption)
   - Leverage Windows (periods of maximum alignment)

5. DUAL-ENDING STRATEGY
   - Default Path (NPC mode — if nothing changes)
   - Architect Path (Hacker mode — if you take control)
```

---

## Stage 6: Retention

After delivering a paid reading:

- **Day 3**: Follow-up DM: "How's the reading sitting with you? Any questions?"
- **Day 30**: "A lot can shift in a month. If you want a check-in on where you are vs your timeline, let me know."
- **Yearly**: Offer $29 yearly transit update before their birthday

---

## Appendix A: Reddit DM Rules (Anti-Ban)

1. **Max 10 DMs/day** from a new account
2. **Always comment first** before DMing
3. **No links in first DM** (Reddit filters them)
4. **No copy-paste DMs** — Reddit detects identical messages
5. **Space out DMs** — at least 15 min between each
6. **If someone reports you as spam**, STOP all DMs for 48 hours
7. **If account gets shadowbanned**: Create backup account now, start building karma

---

## Appendix B: Common Objections + Responses

| Objection | Response |
|-----------|----------|
| "This is just astrology BS" | "It's pattern analysis using a statistical model that's been iterated for 1,000+ years. I don't ask you to believe — I ask you to verify against your own life. If the verification doesn't hit, you walk away." |
| "How is this different from a horoscope?" | "A horoscope is a one-size-fits-all paragraph for your sun sign. This is a full mathematical chart calculated from your exact birth coordinates. It's the difference between a weather report for your city and a GPS coordinate of your house." |
| "Too expensive" | "The free calibration costs nothing and proves whether the system works for you. If it doesn't resonate, you've lost nothing." |
| "I don't know my birth time" | "That's fine — I have methods to narrow it down. The less precise the input, the less precise the output, but we can still get meaningful patterns." |
| "Why do you need my email?" | "To send your reading. I don't do anything else with it. No newsletter, no spam." |

---

## Appendix C: Quick Reference — Hugo's Daily Flow

```
MORNING (1 hr):
  1. Open Reddit
  2. Scan 6 subreddits sorted by New
  3. Leave 5-10 genuine, helpful comments
  4. Note any high-potential posts for later DM

AFTERNOON (1 hr):
  1. Check Reddit replies + DMs
  2. Send 3-5 calibrated DMs to morning leads
  3. Check Google Form for new submissions
  4. Log everything in tracking sheet

EVENING (1 hr):
  1. Process any Google Form submissions through Claude
  2. Send readings/replies
  3. Update tracking sheet
  4. Plan tomorrow's engagement targets
```

---

**End of Pipeline Document**
