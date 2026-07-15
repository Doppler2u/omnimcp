// =============================================================================
// OmniMCP — Agent Store
// File-backed persistence with in-memory fallback for zero-cost hackathon use.
// =============================================================================

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import type { GeneratedAgent } from './types';

const agentStore = new Map<string, GeneratedAgent>();
const STORE_FILE =
  process.env.AGENT_STORE_FILE ||
  `${process.cwd()}/data/agents.json`;
let hasLoadedFromDisk = false;
let writeQueue = Promise.resolve();

// Pre-seed with demo data so the dashboard isn't empty
const DEMO_AGENTS: GeneratedAgent[] = [
  {
    id: 'demo-petstore',
    name: 'petstore_agent',
    description: 'AI agent for the Swagger Petstore API. Manage pets, orders, and users in a virtual pet store.',
    sourceSpecUrl: 'https://petstore3.swagger.io/api/v3/openapi.json',
    baseUrl: 'https://petstore3.swagger.io/api/v3',
    authType: 'apiKey',
    tools: [
      {
        name: 'find_pets_by_status',
        description: 'Find all pets filtered by their status (available, pending, or sold). Use this to browse the pet inventory.',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Pet status to filter by',
              enum: ['available', 'pending', 'sold'],
            },
          },
          required: ['status'],
        },
      },
      {
        name: 'get_pet_by_id',
        description: 'Get detailed information about a specific pet by its numeric ID.',
        inputSchema: {
          type: 'object',
          properties: {
            petId: {
              type: 'integer',
              description: 'The unique ID of the pet to retrieve',
            },
          },
          required: ['petId'],
        },
      },
      {
        name: 'get_store_inventory',
        description: 'Returns a map of status codes to quantities, showing how many pets are in each status category.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_user_by_username',
        description: 'Look up a user account by their username.',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'The username to look up',
            },
          },
          required: ['username'],
        },
      },
    ],
    proxyHandlers: [
      {
        toolName: 'find_pets_by_status',
        method: 'GET',
        pathTemplate: '/pet/findByStatus',
        queryParams: ['status'],
        pathParams: [],
        bodyParams: [],
        headers: {},
      },
      {
        toolName: 'get_pet_by_id',
        method: 'GET',
        pathTemplate: '/pet/{petId}',
        queryParams: [],
        pathParams: ['petId'],
        bodyParams: [],
        headers: {},
      },
      {
        toolName: 'get_store_inventory',
        method: 'GET',
        pathTemplate: '/store/inventory',
        queryParams: [],
        pathParams: [],
        bodyParams: [],
        headers: {},
      },
      {
        toolName: 'get_user_by_username',
        method: 'GET',
        pathTemplate: '/user/{username}',
        queryParams: [],
        pathParams: ['username'],
        bodyParams: [],
        headers: {},
      },
    ],
    status: 'active',
    toolCount: 4,
    callCount: 127,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 'demo-countries',
    name: 'rest_countries_agent',
    description: 'AI agent for the REST Countries API. Query country data including population, area, currencies, languages, and flags.',
    sourceSpecUrl: 'https://restcountries.com',
    baseUrl: 'https://restcountries.com',
    authType: 'none',
    tools: [
      {
        name: 'search_countries_by_name',
        description: 'Search for countries by name. Returns detailed country information including population, capital, region, and more.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Country name or partial name to search for',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'get_country_by_code',
        description: 'Get a specific country by its ISO 3166-1 alpha-2 or alpha-3 code (e.g., US, GBR, IN).',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'ISO country code (e.g., US, GB, IN)',
            },
          },
          required: ['code'],
        },
      },
      {
        name: 'get_countries_by_region',
        description: 'Get all countries in a specific region (africa, americas, asia, europe, oceania).',
        inputSchema: {
          type: 'object',
          properties: {
            region: {
              type: 'string',
              description: 'Region name',
              enum: ['africa', 'americas', 'asia', 'europe', 'oceania'],
            },
          },
          required: ['region'],
        },
      },
    ],
    proxyHandlers: [
      {
        toolName: 'search_countries_by_name',
        method: 'GET',
        pathTemplate: '/v3.1/name/{name}',
        queryParams: [],
        pathParams: ['name'],
        bodyParams: [],
        headers: {},
      },
      {
        toolName: 'get_country_by_code',
        method: 'GET',
        pathTemplate: '/v3.1/alpha/{code}',
        queryParams: [],
        pathParams: ['code'],
        bodyParams: [],
        headers: {},
      },
      {
        toolName: 'get_countries_by_region',
        method: 'GET',
        pathTemplate: '/v3.1/region/{region}',
        queryParams: [],
        pathParams: ['region'],
        bodyParams: [],
        headers: {},
      },
    ],
    status: 'active',
    toolCount: 3,
    callCount: 89,
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
  },
];

// Initialize with demo agents
for (const agent of DEMO_AGENTS) {
  agentStore.set(agent.id!, agent);
}

async function ensureLoaded(): Promise<void> {
  if (hasLoadedFromDisk) return;
  hasLoadedFromDisk = true;

  try {
    const raw = await readFile(STORE_FILE, 'utf8');
    const persistedAgents = JSON.parse(raw) as GeneratedAgent[];

    for (const agent of persistedAgents) {
      if (agent.id) {
        agentStore.set(agent.id, agent);
      }
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      console.warn('Could not load persisted agents, using in-memory store:', error);
    }
  }
}

async function persistStore(): Promise<void> {
  const persist = async () => {
    try {
      const storeDir = STORE_FILE.slice(0, STORE_FILE.lastIndexOf('/'));
      await mkdir(storeDir, { recursive: true });
      await writeFile(
        STORE_FILE,
        JSON.stringify(Array.from(agentStore.values()), null, 2),
        'utf8'
      );
    } catch (error) {
      console.warn('Could not persist agents to disk, continuing in memory:', error);
    }
  };

  writeQueue = writeQueue.then(persist, persist);
  await writeQueue;
}

/**
 * Store a new generated agent.
 */
export async function saveAgent(agent: Omit<GeneratedAgent, 'id' | 'createdAt'>): Promise<GeneratedAgent> {
  await ensureLoaded();

  const id = uuidv4().slice(0, 8);
  const saved: GeneratedAgent = {
    ...agent,
    id,
    createdAt: new Date().toISOString(),
  };
  agentStore.set(id, saved);
  await persistStore();
  return saved;
}

/**
 * Get all agents.
 */
export async function getAllAgents(): Promise<GeneratedAgent[]> {
  await ensureLoaded();

  return Array.from(agentStore.values()).sort(
    (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  );
}

/**
 * Get a single agent by ID.
 */
export async function getAgentById(id: string): Promise<GeneratedAgent | undefined> {
  await ensureLoaded();
  return agentStore.get(id);
}

/**
 * Increment the call count for an agent.
 */
export async function incrementCallCount(id: string): Promise<void> {
  await ensureLoaded();

  const agent = agentStore.get(id);
  if (agent) {
    agent.callCount = (agent.callCount || 0) + 1;
    await persistStore();
  }
}

/**
 * Get aggregate stats.
 */
export async function getStats(): Promise<{ agentCount: number; toolCount: number; callCount: number }> {
  const agents = await getAllAgents();

  return {
    agentCount: agents.length,
    toolCount: agents.reduce((sum, a) => sum + (a.toolCount || 0), 0),
    callCount: agents.reduce((sum, a) => sum + (a.callCount || 0), 0),
  };
}
