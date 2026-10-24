import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { NextResponse } from 'next/server';
import { animals, fosters } from '@/data/mockData';
import {
  runConstraintSolver,
  toEmergencyMatches,
} from '@/lib/matchEngine';
import { DisasterType } from '@/types';

// Claude 3.5 Sonnet on Amazon Bedrock (us-east-1).
// Inference-profile id works across most accounts; falls back if unavailable.
const MODEL_ID =
  process.env.BEDROCK_MODEL_ID ||
  'us.anthropic.claude-3-5-sonnet-20241022-v2:0';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          // Required for temporary credentials (e.g. AWS Workshop Studio).
          sessionToken: process.env.AWS_SESSION_TOKEN,
        }
      : undefined,
});

export async function POST(req: Request) {
  const { animalId, disasterType } = (await req.json()) as {
    animalId: string;
    disasterType?: DisasterType;
  };

  const animal = animals.find((a) => a.id === animalId);
  if (!animal) {
    return NextResponse.json(
      { success: false, error: 'Animal not found' },
      { status: 404 },
    );
  }

  // Always compute the deterministic result — it is our guaranteed fallback.
  const scored = runConstraintSolver(animal, fosters);
  const deterministicMatches = toEmergencyMatches(animal, scored);

  // Attempt live Bedrock reasoning on top of the deterministic shortlist.
  try {
    const prompt = buildPrompt(animal, disasterType);
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 700,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const response = await client.send(command);
    const decoded = JSON.parse(new TextDecoder().decode(response.body));
    const text: string = decoded?.content?.[0]?.text ?? '';
    const parsed = extractJson(text);

    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge Bedrock reasoning with real foster records.
      const bedrockMatches = parsed
        .map((m: any) => {
          const foster = fosters.find((f) => f.id === m.fosterId);
          if (!foster) return null;
          return {
            animalId: animal.id,
            fosterId: foster.id,
            matchScore:
              typeof m.matchScore === 'number' ? m.matchScore : 80,
            reasoning: m.reasoning || 'Matched by Bedrock',
            matchStatus: 'pending' as const,
          };
        })
        .filter(Boolean)
        .slice(0, 3);

      if (bedrockMatches.length > 0) {
        return NextResponse.json({
          success: true,
          source: 'bedrock',
          animal,
          matches: bedrockMatches,
        });
      }
    }
  } catch (err) {
    // Swallow error — we fall through to the deterministic engine below.
    console.error('Bedrock unavailable, using fallback engine:', err);
  }

  return NextResponse.json({
    success: true,
    source: 'fallback',
    animal,
    matches: deterministicMatches,
  });
}

function buildPrompt(animal: any, disasterType?: string): string {
  return `You are an emergency animal-rescue dispatch solver for San Jose, CA.
Disaster context: ${disasterType || animal.emergencyType}.

ANIMAL:
${JSON.stringify(animal, null, 2)}

AVAILABLE FOSTERS:
${JSON.stringify(fosters, null, 2)}

Apply these hard constraints, then rank:
1. Exclude any foster where insideHazardZone == true.
2. Refrigerated medication requires hasBackupPower == true.
3. mobilityNeeds == true requires housingType == "single_story".
4. Respect species (catFriendly/dogFriendly) and maxWeight limits.

Return STRICTLY a JSON array (no prose) of the top 3 matches:
[{ "fosterId": string, "matchScore": number 0-100, "reasoning": "concise bullet points" }]`;
}

function extractJson(text: string): any {
  try {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.slice(start, end + 1));
    }
    return JSON.parse(text);
  } catch {
    return null;
  }
}
