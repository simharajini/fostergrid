import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { NextResponse } from 'next/server';

// Partner 2 (Operations): Bedrock intake-note parser with deterministic fallback.
// This endpoint parses a free-text shelter intake note into structured
// matching constraints using Claude 3.5 Sonnet on Amazon Bedrock.

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
        }
      : undefined,
});

export async function POST(req: Request) {
  try {
    const { intakeNote } = await req.json();

    const prompt = `Extract JSON matching constraints from this animal shelter intake note:
"${intakeNote}"
Return strictly JSON only, no prose:
{ "requiresSolar": boolean, "maxStories": number, "excludeZones": string[] }`;

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const response = await client.send(command);
    const decoded = JSON.parse(new TextDecoder().decode(response.body));
    const text: string = decoded?.content?.[0]?.text ?? '';

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    const result = JSON.parse(text.slice(start, end + 1));

    return NextResponse.json({ success: true, source: 'bedrock', result });
  } catch (error) {
    // Fallback engine if Bedrock fails or credentials missing during demo.
    console.error('Bedrock unavailable, using fallback:', error);
    return NextResponse.json({
      success: true,
      source: 'fallback',
      fallback: true,
      result: {
        requiresSolar: true,
        maxStories: 1,
        excludeZones: ['East Foothills Hazard Zone'],
      },
    });
  }
}
