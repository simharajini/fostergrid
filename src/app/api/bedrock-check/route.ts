import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { NextResponse } from 'next/server';

// Diagnostic endpoint: visit /api/bedrock-check in a browser to see exactly
// why Bedrock is (or isn't) connecting. Safe to remove after the demo.
export async function GET() {
  const region = process.env.AWS_REGION || 'us-east-1';
  const modelId =
    process.env.BEDROCK_MODEL_ID ||
    'us.anthropic.claude-3-5-sonnet-20241022-v2:0';

  const env = {
    hasAccessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretAccessKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    hasSessionToken: !!process.env.AWS_SESSION_TOKEN,
    region,
    modelId,
  };

  const client = new BedrockRuntimeClient({
    region,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          }
        : undefined,
  });

  try {
    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 20,
        messages: [{ role: 'user', content: 'Say OK' }],
      }),
    });
    const response = await client.send(command);
    const decoded = JSON.parse(new TextDecoder().decode(response.body));
    return NextResponse.json({
      bedrockWorking: true,
      env,
      sample: decoded?.content?.[0]?.text ?? decoded,
    });
  } catch (err: any) {
    return NextResponse.json({
      bedrockWorking: false,
      env,
      errorName: err?.name,
      errorMessage: err?.message,
    });
  }
}
