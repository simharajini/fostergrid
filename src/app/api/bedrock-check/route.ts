import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import {
  BedrockClient,
  ListFoundationModelsCommand,
} from '@aws-sdk/client-bedrock';
import { NextResponse } from 'next/server';

// Diagnostic endpoint: visit /api/bedrock-check in a browser.
// Lists the Claude models your account can actually use, and tests invoking one.
export async function GET() {
  const region = process.env.AWS_REGION || 'us-east-1';

  const creds =
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          sessionToken: process.env.AWS_SESSION_TOKEN,
        }
      : undefined;

  const env = {
    hasAccessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretAccessKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    hasSessionToken: !!process.env.AWS_SESSION_TOKEN,
    region,
    configuredModelId: process.env.BEDROCK_MODEL_ID || '(none set)',
  };

  // 1. List available Anthropic Claude models in this account/region.
  let claudeModels: string[] = [];
  try {
    const bedrock = new BedrockClient({ region, credentials: creds });
    const list = await bedrock.send(
      new ListFoundationModelsCommand({ byProvider: 'Anthropic' }),
    );
    claudeModels = (list.modelSummaries ?? [])
      .map((m) => m.modelId!)
      .filter(Boolean);
  } catch (err: any) {
    return NextResponse.json({
      step: 'list-models',
      env,
      error: { name: err?.name, message: err?.message },
    });
  }

  // 2. Try invoking candidate models (prefer inference profiles, newest first).
  const runtime = new BedrockRuntimeClient({ region, credentials: creds });
  const candidates = buildCandidates(claudeModels);
  const attempts: any[] = [];

  for (const modelId of candidates) {
    try {
      const resp = await runtime.send(
        new InvokeModelCommand({
          modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 20,
            messages: [{ role: 'user', content: 'Say OK' }],
          }),
        }),
      );
      const decoded = JSON.parse(new TextDecoder().decode(resp.body));
      return NextResponse.json({
        bedrockWorking: true,
        workingModelId: modelId,
        env,
        availableClaudeModels: claudeModels,
        sample: decoded?.content?.[0]?.text ?? decoded,
      });
    } catch (err: any) {
      attempts.push({ modelId, error: err?.name });
    }
  }

  return NextResponse.json({
    bedrockWorking: false,
    env,
    availableClaudeModels: claudeModels,
    attempts,
  });
}

// Prefer US cross-region inference profiles (us.*) which on-demand invoke needs,
// then bare IDs. Newest Sonnet first.
export function buildCandidates(available: string[]): string[] {
  const preferredOrder = [
    'us.anthropic.claude-sonnet-5',
    'us.anthropic.claude-sonnet-4',
    'anthropic.claude-sonnet-4',
    'us.anthropic.claude-3-7-sonnet',
    'anthropic.claude-3-5-haiku',
    'us.anthropic.claude-3-5-haiku',
  ];

  const scored = available
    .flatMap((id) => [`us.${id}`, id]) // try inference-profile prefix + bare
    .filter((id, i, arr) => arr.indexOf(id) === i);

  // Sort: ids matching a preferred prefix first, Sonnet before Haiku.
  scored.sort((a, b) => rank(a, preferredOrder) - rank(b, preferredOrder));
  return scored;
}

function rank(id: string, order: string[]): number {
  for (let i = 0; i < order.length; i++) {
    if (id.includes(order[i].replace('us.', ''))) return i;
  }
  return 999;
}
