# Kismet — Master Reference File

> Hugo 嘅完整 system 索引。所有 links、accounts、passwords 喺晒呢度。
> 最後更新：2026-08-13

---

## 🌐 Website URLs

| Page | URL | 用途 |
|---|---|---|
| Homepage | https://web-nine-zeta-27.vercel.app/ | 命盤計算器 |
| Form | https://web-nine-zeta-27.vercel.app/form | Lead intake form |
| Dashboard | https://web-nine-zeta-27.vercel.app/dashboard | 你睇 leads（要密碼） |
| Reading | https://web-nine-zeta-27.vercel.app/reading | Self-service reading |
| Self-Service | https://web-nine-zeta-27.vercel.app/self-service | Private reading instructions |
| Pricing | https://web-nine-zeta-27.vercel.app/pricing | 收費餐牌 |

---

## 🔑 密碼 & Keys

| Item | Value |
|---|---|
| Dashboard 密碼 | `Kismet913!` |
| Setup key（舊，setup 用） | `kismet-admin-2026` |
| API 讀 data（已轉 password auth） | Bearer `Kismet913!` |

---

## 🏗️ 平台 Dashboards

| Platform | URL |
|---|---|
| Vercel | https://vercel.com/dashboard |
| Vercel Project | https://vercel.com/sparknerteam-1307s-projects/web |
| Supabase | https://vercel.com/sparknerteam-1307s-projects/~/stores/integration/store_YQwQIO2QbfWAaSdi |
| Stripe | https://dashboard.stripe.com |
| GitHub Repo | https://github.com/sparknerteam-gif/ziwei-doushu |

---

## 💳 Stripe Payment Links

| Product | Price | Link |
|---|---|---|
| Single Area | $29 | https://buy.stripe.com/7sY9ASeRO6Ld3Jb7IJgMw08 |
| 3-Area Bundle | $59 | https://buy.stripe.com/bJefZg6li5H9djL0ghgMw07 |
| Full Chart | $89 | https://buy.stripe.com/eVqdR8fVS8Tl0wZfbbgMw06 |
| 5 Questions | $19 | https://buy.stripe.com/8x26oGeROc5x5Rj7IJgMw05 |
| 10 Questions | $29 | https://buy.stripe.com/5kQ5kC9xu6Ld2F75ABgMw04 |
| 50 Questions | $79 | https://buy.stripe.com/cNiaEW7pmc5xfrT7IJgMw03 |
| Lifetime | $149 | https://buy.stripe.com/3cIbJ0252d9B3JbfbbgMw01 |

---

## 📊 Database Tables（Supabase PostgreSQL）

| Table | 用途 |
|---|---|
| `submissions` | Lead form data |
| `purchases` | Stripe payment tracking |
| `feedback` | Reading feedback（training） |

---

## 🔒 Security 現狀

| Item | 狀態 |
|---|---|
| Dashboard 隱藏（nav 冇 link） | ✅ |
| Dashboard 密碼保護 | ✅ `Kismet913!` |
| API data 讀取（password auth） | ✅ |
| Service role key（server-side only） | ✅ |
| PII storage（private Supabase） | ✅ |

---

## 📁 關鍵 Files（本地 repo）

| File | 用途 |
|---|---|
| `CLAUDE.md` | Project instructions |
| `western-cultural-adaptation.md` | Star archetype mapping |
| `kismet-training-system.md` | Training methodology |
| `stripe-setup-guide.md` | Stripe setup guide |
| `reddit-launch-kit.md` | Reddit strategy |
| `hugo-calibration-example.md` | Hugo 嘅 calibration 例子 |
| `leads/` | Lead files（CRM） |
| `logo/` | Logo files（SVG + PNG） |
| `logo/export/` | Logo PNG exports |

---

## 📱 Social Media（待開設）

| Platform | 建議 Username |
|---|---|
| Reddit | `u/kismet-decoder` |
| Instagram | `@kismet.decoder` |
| X/Twitter | `@kismetdecoder` |

Profile pic: `logo/export/kismet-icon-512.png`
Header: `logo/export/kismet-full-logo.png`
Bio link: `https://web-nine-zeta-27.vercel.app/form`

---

## 🎯 完整 Business Flow

```
1. Lead 搵到你（Reddit/IG/content）
2. Lead 填 form → Supabase
3. 你去 dashboard 睇 lead（密碼 Kismet913!）
4. Copy DM → send 俾 lead
5. Lead 去 pricing page → Stripe 俾錢
6. Webhook → Supabase 記錄 purchase
7. 你 deliver reading（email/DM）
8. Lead 問 free questions → 用完 → upsell
9. LTV accumulates
```
