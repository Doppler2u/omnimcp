// =============================================================================
// GET/POST /api/agents/[id]/mcp — MCP-style JSON-RPC surface for generated agents
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAgentById, incrementCallCount } from '@/lib/agent-store';
import { executeAgentTool } from '@/lib/tool-proxy';

interface JsonRpcRequest {
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

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
    name: agent.name,
    description: agent.description,
    protocol: 'mcp-json-rpc',
    transport: 'http',
    endpoint: `/api/agents/${id}/mcp`,
    tools: agent.tools,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = await getAgentById(id);

  if (!agent) {
    return jsonRpcError(null, -32004, 'Agent not found', 404);
  }

  let body: JsonRpcRequest;
  try {
    body = await request.json();
  } catch {
    return jsonRpcError(null, -32700, 'Parse error', 400);
  }

  const requestId = body.id ?? null;

  if (body.method === 'initialize') {
    return jsonRpcResult(requestId, {
      protocolVersion: '2025-06-18',
      serverInfo: {
        name: agent.name,
        version: '0.1.0',
      },
      capabilities: {
        tools: {},
      },
    });
  }

  if (body.method === 'tools/list') {
    return jsonRpcResult(requestId, {
      tools: agent.tools,
    });
  }

  if (body.method === 'tools/call') {
    const toolName = body.params?.name;
    const toolArgs = body.params?.arguments;

    if (typeof toolName !== 'string') {
      return jsonRpcError(requestId, -32602, 'tools/call requires params.name');
    }

    const execution = await executeAgentTool(
      agent,
      toolName,
      isRecord(toolArgs) ? toolArgs : {}
    );

    if (!execution.success) {
      return jsonRpcError(requestId, -32000, execution.error || 'Tool execution failed', 400, {
        result: execution.result,
        latencyMs: execution.latencyMs,
        meta: execution.meta,
      });
    }

    await incrementCallCount(id);

    return jsonRpcResult(requestId, {
      content: [
        {
          type: 'text',
          text: JSON.stringify(execution.result, null, 2),
        },
      ],
      structuredContent: execution.result,
      meta: {
        latencyMs: execution.latencyMs,
        ...execution.meta,
      },
    });
  }

  return jsonRpcError(requestId, -32601, `Method not found: ${body.method || 'unknown'}`, 404);
}

function jsonRpcResult(id: JsonRpcRequest['id'], result: unknown) {
  return NextResponse.json({
    jsonrpc: '2.0',
    id,
    result,
  });
}

function jsonRpcError(
  id: JsonRpcRequest['id'],
  code: number,
  message: string,
  status = 500,
  data?: unknown
) {
  return NextResponse.json(
    {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
        data,
      },
    },
    { status }
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
