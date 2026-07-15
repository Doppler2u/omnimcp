// =============================================================================
// GET /api/agents/[id] — Get a single agent's full details
// POST /api/agents/[id] — Execute a tool call via proxy
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAgentById, incrementCallCount } from '@/lib/agent-store';
import { executeAgentTool } from '@/lib/tool-proxy';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = await getAgentById(id);

  if (!agent) {
    return NextResponse.json(
      { success: false, error: 'Agent not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    agent,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = await getAgentById(id);

  if (!agent) {
    return NextResponse.json(
      { success: false, error: 'Agent not found' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { toolName, arguments: toolArgs } = body;

    if (!toolName) {
      return NextResponse.json(
        { success: false, error: 'toolName is required' },
        { status: 400 }
      );
    }

    const execution = await executeAgentTool(agent, toolName, toolArgs || {});

    if (execution.success) {
      await incrementCallCount(id);
    }

    return NextResponse.json(execution, { status: execution.success ? 200 : 400 });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Proxy request failed: ${(error as Error).message}`,
      },
      { status: 502 }
    );
  }
}
