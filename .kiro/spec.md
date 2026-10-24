<!-- /.kiro/spec.md -->
# FosterGrid - Emergency Animal Shelter Matching Spec

## Overview
Automated dispatch engine matching emergency shelter intake notes with local
foster homes in San Jose. When a shelter loses power, HVAC, or structural
safety, FosterGrid relocates at-risk animals to compliant foster homes in
minutes instead of hours.

## Requirements
1. Parse natural language emergency shelter intake notes using AWS Bedrock
   (Claude 3.5 Sonnet).
2. Extract required constraints: solar power, story count, location hazard
   zone exclusion.
3. Filter local San Jose foster database deterministically as a fallback.
4. Trigger emergency dispatch alerts to compliant foster candidates.

## Hard Constraints (enforced by both Bedrock and the fallback engine)
- Exclude any foster inside the East Foothills wildfire hazard zone.
- Refrigerated medication requires a foster with reliable backup power.
- Mobility needs (no stairs) require single-story housing.
- Respect species compatibility and maximum weight capacity.

## Architecture
- **Frontend / Hosting:** Next.js 14 (App Router) on Vercel
- **AI Reasoning Engine:** AWS Bedrock — anthropic.claude-3-5-sonnet
- **Fail-Safe Layer:** Deterministic TypeScript constraint solver
  (`src/lib/matchEngine.ts`), generated via Kiro so the live demo never breaks.
- **IDE & Workflow:** Kiro (spec-driven agentic generation)

## Local Scenario
San Jose / SJSU area. Shelter: Downtown San Jose. Hazard zone: East Foothills
(wildfire). Fosters span Willow Glen, Campbell border, South San Jose, and the
foothills.
