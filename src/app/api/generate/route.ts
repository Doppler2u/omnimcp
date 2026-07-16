// =============================================================================
// POST /api/generate — Main generation endpoint
// Accepts an OpenAPI spec URL, runs AI engine, returns generated agent
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { parseOpenAPISpec } from '@/lib/openapi-parser';
import { generateMCPTools, generateTerminalLines } from '@/lib/gemini-client';
import { saveAgent } from '@/lib/agent-store';
import type { AgentAuthConfig } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { specUrl, specJson, credentialEnvVar, credentialName, credentialLocation } = body;

    if (!specUrl && !specJson) {
      return NextResponse.json(
        { success: false, error: 'Please provide either specUrl or specJson' },
        { status: 400 }
      );
    }

    const resolvedSpecUrl =
      typeof specUrl === 'string' && specUrl.startsWith('/')
        ? new URL(specUrl, request.nextUrl.origin).toString()
        : specUrl;

    // Step 1: Parse the OpenAPI spec
    const parsedApi = await parseOpenAPISpec(resolvedSpecUrl || specJson);

    if (parsedApi.endpoints.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid endpoints found in the API spec' },
        { status: 400 }
      );
    }

    // Step 2: Generate MCP tools using Gemini AI
    const { agentName, agentDescription, tools, proxyHandlers } =
      await generateMCPTools(parsedApi);

    // Step 3: Save the agent
    const agent = await saveAgent({
      name: agentName,
      description: agentDescription,
      sourceSpecUrl: resolvedSpecUrl || 'inline-spec',
      baseUrl: parsedApi.baseUrl,
      authType: parsedApi.authType,
      authConfig: buildAuthConfig({
        authType: parsedApi.authType,
        credentialEnvVar,
        credentialName,
        credentialLocation,
        parsedHeaderName: parsedApi.authDetails?.headerName,
        parsedQueryParamName: parsedApi.authDetails?.queryParamName,
      }),
      tools,
      proxyHandlers,
      status: 'active',
      toolCount: tools.length,
      callCount: 0,
    });

    // Step 4: Compute a real verification hash for the schema
    const specContentToHash = specJson ? JSON.stringify(specJson) : JSON.stringify(parsedApi);
    const verificationHash = '0x' + crypto.createHash('sha256').update(specContentToHash).digest('hex');

    // Step 5: Generate terminal output lines for the frontend animation
    const terminalLines = generateTerminalLines(parsedApi, agentName, tools, verificationHash);

    return NextResponse.json({
      success: true,
      agent,
      terminalLines,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

function buildAuthConfig(input: {
  authType: string;
  credentialEnvVar?: unknown;
  credentialName?: unknown;
  credentialLocation?: unknown;
  parsedHeaderName?: string;
  parsedQueryParamName?: string;
}): AgentAuthConfig | undefined {
  const envVarName =
    typeof input.credentialEnvVar === 'string' ? input.credentialEnvVar.trim() : '';

  if (!envVarName || input.authType === 'none' || input.authType === 'oauth2') {
    return undefined;
  }

  if (input.authType === 'bearer') {
    return {
      type: 'bearer',
      envVarName,
      location: 'header',
      name: 'Authorization',
    };
  }

  if (input.authType === 'basic') {
    return {
      type: 'basic',
      envVarName,
      location: 'header',
      name: 'Authorization',
    };
  }

  if (input.authType === 'apiKey') {
    const location =
      input.credentialLocation === 'query' || input.parsedQueryParamName ? 'query' : 'header';
    const fallbackName = location === 'query' ? input.parsedQueryParamName : input.parsedHeaderName;
    const name =
      typeof input.credentialName === 'string' && input.credentialName.trim()
        ? input.credentialName.trim()
        : fallbackName || 'X-API-Key';

    return {
      type: 'apiKey',
      envVarName,
      location,
      name,
    };
  }

  return undefined;
}
