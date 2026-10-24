# FosterGrid — Tech Steering

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide icons.
- AWS Bedrock via `@aws-sdk/client-bedrock-runtime` (Claude 3.5 Sonnet).
- Region: us-east-1.

## Conventions
- Shared types live in `src/types/index.ts`.
- Mock data lives in `src/data/mockData.ts` (San Jose / SJSU locations).
- API routes under `src/app/api/*` must wrap every Bedrock call in try/catch
  and fall back to `src/lib/matchEngine.ts` on any failure.
- Never commit AWS credentials. Secrets go in Vercel environment variables.
