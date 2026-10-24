import { Animal, Foster, EmergencyMatch } from '@/types';

// ---------------------------------------------------------------------------
// Deterministic constraint-solver fallback engine.
// Runs the same hard-constraint logic we ask Bedrock to perform, so the live
// demo ALWAYS returns sensible matches even if Bedrock access is unavailable.
// ---------------------------------------------------------------------------

export interface ScoredMatch {
  foster: Foster;
  matchScore: number;
  reasoning: string;
}

export function runConstraintSolver(
  animal: Animal,
  fosters: Foster[],
): ScoredMatch[] {
  const results: ScoredMatch[] = [];

  for (const foster of fosters) {
    // --- HARD CONSTRAINTS (disqualifiers) ---
    if (!foster.activeStatus) continue;
    // 1. Filter out fosters inside the hazard zone.
    if (foster.insideHazardZone) continue;
    // Species compatibility
    if (animal.species === 'cat' && !foster.catFriendly) continue;
    if (animal.species === 'dog' && !foster.dogFriendly) continue;
    // Weight capacity
    if (animal.weight > foster.maxWeight) continue;
    // 2a. Refrigerated meds require reliable backup power.
    if (animal.requiresRefrigeration && !foster.hasBackupPower) continue;
    // 2b. Mobility needs require single-story housing.
    if (animal.mobilityNeeds && foster.housingType !== 'single_story') continue;

    // --- SOFT SCORING (0-100) ---
    let score = 60;
    const reasons: string[] = ['Outside hazard zone'];

    if (animal.requiresRefrigeration && foster.hasBackupPower) {
      score += 15;
      reasons.push(
        `Backup power (${foster.powerType}) protects refrigerated meds`,
      );
    }
    if (animal.mobilityNeeds && foster.housingType === 'single_story') {
      score += 15;
      reasons.push('Single-story home — no stairs for mobility needs');
    }
    if (foster.powerType === 'solar') {
      score += 5;
      reasons.push('Solar battery = resilient during grid outage');
    }
    if (foster.maxWeight >= animal.weight + 20) {
      score += 5;
      reasons.push('Ample weight capacity for comfort');
    }

    score = Math.min(100, score);

    results.push({
      foster,
      matchScore: score,
      reasoning: reasons.map((r) => `• ${r}`).join('\n'),
    });
  }

  // Sort best-first, return top 3
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}

export function toEmergencyMatches(
  animal: Animal,
  scored: ScoredMatch[],
): EmergencyMatch[] {
  return scored.map((s) => ({
    animalId: animal.id,
    fosterId: s.foster.id,
    matchScore: s.matchScore,
    reasoning: s.reasoning,
    matchStatus: 'pending' as const,
  }));
}
