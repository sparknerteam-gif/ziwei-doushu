# 紫微斗數 Web App — Vercel Deploy Guide

## 你要做咩

以下係 3 個簡單步驟，你自己喺 Vercel Dashboard 搞掂（CLI 因為 monorepo workspace package 問題搞唔掂）。

---

## Step 1: 先去 GitHub 開一個 repo

喺 `https://github.com/new` 開一個 private repo，叫 `ziwei-doushu`。

然後喺你部機 run：

```bash
cd C:\紫微斗數

# Initialize git (如果未做)
git init

# Add 所有 files
git add -A

# Commit
git commit -m "Ziwei Doushu web app with DST-aware true solar time engine"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/ziwei-doushu.git
git branch -M main
git push -u origin main
```

---

## Step 2: Vercel 連接 GitHub

1. 去 `https://vercel.com/sparknerteam-1307s-projects`（你嘅 Vercel team dashboard）
2. Click 個 `web` project
3. 去 **Settings** → **Git**
4. Connect 你啱啱開嗰個 GitHub repo
5. Vercel 會自動 detect 到係 Next.js project

---

## Step 3: Vercel Project 設定

去 **Settings** → **General**，填好以下：

| Field | Value |
|---|---|
| **Framework** | Next.js |
| **Root Directory** | `apps/web` |
| **Build Command** | `cd ../.. && pnpm i --no-frozen-lockfile && cd packages/zwds-core && pnpm build && cd ../../apps/web && npm install && next build` |
| **Install Command** | `npm install -g pnpm@9 && pnpm install --no-frozen-lockfile` |
| **Output Directory** | `.next` |
| **Node.js Version** | `24.x` |

---

## 完成

撳 **Deploy**，等 2-3 分鐘，你就會有一個公開嘅 URL（例如 `https://web-xxx.vercel.app`）。

如果 Build 失敗，Cap 個 error message 俾我，我幫你 troubleshoot。
