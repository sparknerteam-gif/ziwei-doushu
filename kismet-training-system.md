# Kismet Training System — Knowledge Base

> How Claude (kismet-engine) gets more accurate over time through accumulated client feedback.
> This file evolves. Every validated reading adds to it.

---

## Training Architecture

```
Client Reading → Claims with chart anchors
       ↓
Client Feedback: ✅ Accurate / ❌ Inaccurate
       ↓
Pattern DB: Which star→interpretation mappings are validated?
       ↓
Prompt Evolution: Incorporate validated patterns, deprecate false ones
       ↓
Next Reading: More accurate because it's built on validated ground truth
```

---

## Validated Interpretation Patterns

### Format
```
[STAR/PALACE/COMBINATION] → [INTERPRETATION] → [Validation Count: ✅ X / ❌ Y]
```

### Currently Validated (from Hugo's chart + calibration)

| Pattern | Interpretation | ✅ | ❌ |
|---|---|---|---|
| 廉貞+破軍 in 父母宮 | Intense relationship with authority/parents. Sudden disruptions in origin story. | 0 | 1 |
| 武曲+貪狼 in 仆役宮 | Gambling/risk behavior activated through social circles | 0 | 1 |
| 貪狼化忌 (2023) | Major financial loss through speculative investment | 1 | 0 |
| 廉貞化忌 (2026) | Immune system collapse, hospitalization, forced rest | 1 | 0 |
| 命宮 empty (借天同太陰) | Fluid identity, adapts to environment, Barnum-prone self-description | 1 | 0 |
| 天同+太陰+祿存 in 官祿宮 | Career suited for analytical/creative work. Avoids high-pressure environments. | 1 | 0 |
| 2023 癸卯年 貪狼化忌 in 財帛線 | Devastating financial reset. Complete wipeout. | 1 | 0 |
| 2026 丙午年 廉貞化忌 in 疾厄線 | Immune/health system crash. Hospitalization. Forced pause. | 1 | 0 |

---

## Anti-Barnum Rules (Hard Constraints)

These MUST be followed in every reading. Violations = inaccurate reading.

1. **Every claim must cite specific chart data** (star name + palace + transformation)
2. **No claim without an anchor** — if you can't point to the chart element, don't make the claim
3. **Testability required** — every claim must be falsifiable by the client
4. **Specific > General** — "Your Ming Palace 廉貞+破軍 creates tension with authority" NOT "You sometimes struggle with authority figures"
5. **Event-anchored** — whenever possible, tie traits to specific past events
6. **Date-stamped** — if claiming a future pattern, specify the timeframe and why (which 流年/大限)

---

## Differential Question Templates

### Health Events
```
Q: "Your health event was primarily: A) internal/immune/viral OR B) external/injury/surgical?"
→ A = 廉貞 pattern, B = 七殺/破軍 pattern
```

### Financial Behavior
```
Q: "Your money loss was: A) a one-time misjudgment OR B) part of a pattern of risk-taking?"
→ A = 天機/太陰 pattern, B = 貪狼/廉貞 pattern
```

### Relationship Patterns
```
Q: "Your significant relationships tend to be with people who are: A) older/more established OR B) same age or younger?"
→ A = 天府/天梁 pattern, B = 太陽/貪狼 pattern
```

### Career Drive
```
Q: "Your work motivation is primarily: A) internal standards of excellence OR B) external recognition and status?"
→ A = 武曲/紫微 pattern, B = 太陽/貪狼 pattern
```

---

## Western Cultural Templates (Tested)

### Self-Identity Framing
Instead of "Your destiny is..." → "Your pattern architecture shows..."

### Challenge Reframing
Instead of "This star afflicts you" → "This configuration creates friction in [specific area]. Here's what people with this pattern do to navigate it."

### Agency Preservation
Always end actionable insights with: "This is the pattern. What you build on it is your design."

---

## Training Data Collection

Every client interaction should capture:

```json
{
  "chartData": { /* engine-computed chart */ },
  "calibrationMethod": "single | multi-event | unknown-time",
  "differentialAnswers": { "Q1": "A", "Q2": "B" },
  "readingClaims": [
    { "claim": "...", "chartAnchor": "廉貞+貪狼@命宮", "clientFeedback": "accurate" },
    { "claim": "...", "chartAnchor": "2023貪狼化忌@財帛", "clientFeedback": "accurate" }
  ],
  "overallAccuracy": "high | medium | low",
  "culturalContext": "western | asian | mixed"
}
```

---

*This file is the training memory. Update it after every validated reading. Accuracy compounds.*
