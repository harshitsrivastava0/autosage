# AutoSage — India's Smartest Car Advisor

AI-powered car advisor built on CarDekho's data ecosystem. Answer 4 questions, get 3 AI-ranked cars with real ownership costs, streaming chat advisor, and one-tap comparison.

## Prerequisites

- Node.js 18+
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

## Local setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local — add your ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Anthropic API key for Claude |
| `NEXT_PUBLIC_APP_URL` | ✅ | Full URL of deployed app (e.g. `https://autosage.vercel.app`) |

## Deploy to Vercel

```bash
npx vercel deploy
```

Or connect the GitHub repo in the [Vercel dashboard](https://vercel.com/new).

**After deploying:** go to Project Settings → Environment Variables → add `ANTHROPIC_API_KEY` and `NEXT_PUBLIC_APP_URL`, then trigger a redeployment.

## Tech stack

Next.js 16 · TypeScript · Tailwind CSS v4 · Claude Sonnet · sql.js (SQLite/WASM)
