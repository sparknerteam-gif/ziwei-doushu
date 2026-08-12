# Stripe Payment Links Setup

> Hugo, follow these steps to create payment links on Stripe. You only need to do this ONCE.

---

## Step 1: Create Stripe Account

1. Go to **https://stripe.com**
2. Click **Sign Up**
3. Use your email: `sparknerteam@gmail.com`
4. Verify your email
5. No need to complete full business verification for now — test mode is fine

---

## Step 2: Create Products & Prices

Go to **Stripe Dashboard** → **Products** → **Add Product**

### Product 1: Single Area Reading
- Name: `Kismet — Single Area Reading`
- Description: `1 direction deep-dive analysis (~500 words) + 3 free follow-up questions`
- Price: **$29.00** (One-time)
- Save

### Product 2: 3-Area Bundle
- Name: `Kismet — 3-Area Bundle`
- Description: `3 direction analysis (~1500 words) + 5 free follow-up questions`
- Price: **$59.00** (One-time)
- Save

### Product 3: Full Chart Reading
- Name: `Kismet — Full Chart Reading`
- Description: `All 6 directions (~3000 words) + 10 free follow-up questions + Priority 24hr delivery`
- Price: **$89.00** (One-time)
- Save

### Product 4: 5 Extra Questions
- Name: `Kismet — 5 Extra Questions`
- Price: **$19.00** (One-time)
- Save

### Product 5: 10 Extra Questions
- Name: `Kismet — 10 Extra Questions`
- Price: **$29.00** (One-time)
- Save

### Product 6: 50 Extra Questions
- Name: `Kismet — 50 Extra Questions`
- Price: **$79.00** (One-time)
- Save

### Product 7: Lifetime Access
- Name: `Kismet — Lifetime Access (Beta)`
- Description: `All 6 areas + 100 questions + priority forever`
- Price: **$149.00** (One-time)
- Save

---

## Step 3: Create Payment Links

For EACH product, go to the product page → **Create payment link**

After creating each link, copy it and paste it into the file:
`apps/web/src/app/pricing/page.tsx`

Replace the `STRIPE_LINKS` object at the top of the file:

```typescript
const STRIPE_LINKS = {
  single: "https://buy.stripe.com/7sY9ASeRO6Ld3Jb7IJgMw08",
  bundle: "https://buy.stripe.com/bJefZg6li5H9djL0ghgMw07",
  full: "https://buy.stripe.com/eVqdR8fVS8Tl0wZfbbgMw06",
  questions5: "https://buy.stripe.com/8x26oGeROc5x5Rj7IJgMw05",
  questions10: "https://buy.stripe.com/5kQ5kC9xu6Ld2F75ABgMw04",
  questions50: "https://buy.stripe.com/cNiaEW7pmc5xfrT7IJgMw03",
  lifetime: "https://buy.stripe.com/3cIbJ0252d9B3JbfbbgMw01",
};
```

---

## Step 4: Set Up Webhook (for purchase tracking)

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://web-nine-zeta-27.vercel.app/api/stripe-webhook`
4. Events to listen for: `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Run this command to add it to Vercel:

```
! cd C:\紫微斗數 && vercel env add STRIPE_WEBHOOK_SECRET production --value "whsec_oZrhfiDV5XzGxl9tlNu8uosDYqY6KHpu"
```

---

## Step 5: Deploy

After replacing the Stripe links:
```
! cd C:\紫微斗數 && git add . && git commit -m "feat: Stripe payment links" && git push
```
