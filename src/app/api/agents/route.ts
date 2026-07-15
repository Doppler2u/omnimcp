// =============================================================================
// GET /api/agents — List all generated agents
// =============================================================================

import { NextResponse } from 'next/server';
import { getAllAgents, getStats } from '@/lib/agent-store';

export async function GET() {
  const agents = await getAllAgents();
  const stats = await getStats();

  return NextResponse.json({
    success: true,
    agents: agents.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      sourceSpecUrl: a.sourceSpecUrl,
      status: a.status,
      toolCount: a.toolCount,
      callCount: a.callCount,
      createdAt: a.createdAt,
    })),
    stats,
  });
}
