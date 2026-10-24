# 🚨 FosterGrid — Rapid Crisis Evacuation & Placement Dispatcher

AI-driven emergency dispatch that matches shelter animals to safe foster homes
in **minutes** when a facility loses power, HVAC, or structural safety.

Built for **SparkHill Hacks 2026 (SJSU AI Hackathon)** — AWS Track.

## What it does
When disaster strikes a Downtown San Jose shelter, FosterGrid:
1. Parses each animal's natural-language medical notes.
2. Filters out foster homes inside the **East Foothills wildfire hazard zone**.
3. Enforces hard medical constraints — refrigerated insulin needs **backup
   power**, mobility issues need **single-story** homes.
4. Dispatches an instant mobile alert to the best-matched foster volunteer.

## Tech stack
| Layer | Technology |
|-------|-----------|
| IDE & Workflow | **Kiro** (spec-driven agentic generation — see `/.kiro`) |
| Frontend / Hosting | **Next.js 14** (App Router) on **Vercel** |
| AI Reasoning | **AWS Bedrock** — Claude 3.5 Sonnet |
| Fail-Safe Layer | Deterministic TypeScript constraint solver |
| Styling | Tailwind CSS + Lucide icons |

## Run locally
```bash
npm install
cp .env.example .env.local   # add your AWS credentials
npm run dev                  # http://localhost:3000
```

Open **/dashboard** and click **"Run Bedrock AI Match"** on Max (the diabetic
dog). The app uses live Bedrock when credentials are present, and a
deterministic fallback engine otherwise — so the demo **never breaks**.

## Key routes
- `/` — landing page
- `/dashboard` — shelter worker dispatch console
- `/foster-view` — foster volunteer mobile alert simulation
- `POST /api/match-foster` — ranks top-3 fosters for an animal
- `POST /api/dispatch` — parses an intake note into structured constraints

## Environment variables (set these in Vercel)
- `AWS_REGION` = `us-east-1`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
