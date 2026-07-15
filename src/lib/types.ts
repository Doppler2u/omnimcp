// =============================================================================
// OmniMCP — Core Type Definitions
// =============================================================================

/** Normalized representation of a parsed OpenAPI endpoint */
export interface ParsedEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  operationId: string;
  summary: string;
  description: string;
  parameters: ParsedParameter[];
  requestBody?: ParsedRequestBody;
  responseSchema?: Record<string, unknown>;
  tags: string[];
}

export interface ParsedParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  description: string;
  required: boolean;
  type: string;
  enum?: string[];
  default?: unknown;
}

export interface ParsedRequestBody {
  description: string;
  required: boolean;
  contentType: string;
  schema: Record<string, unknown>;
}

/** Fully parsed and normalized API spec */
export interface ParsedAPI {
  title: string;
  description: string;
  version: string;
  baseUrl: string;
  endpoints: ParsedEndpoint[];
  authType: 'none' | 'apiKey' | 'bearer' | 'basic' | 'oauth2';
  authDetails?: {
    headerName?: string;
    queryParamName?: string;
    scheme?: string;
  };
}

/** MCP Tool definition (following MCP spec) */
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, MCPPropertySchema>;
    required: string[];
  };
}

export interface MCPPropertySchema {
  type: string;
  description: string;
  enum?: string[];
  default?: unknown;
  items?: MCPPropertySchema;
}

/** Complete generated MCP agent configuration */
export interface GeneratedAgent {
  id?: string;
  name: string;
  description: string;
  sourceSpecUrl: string;
  baseUrl: string;
  authType: string;
  tools: MCPToolDefinition[];
  proxyHandlers: ProxyHandler[];
  authConfig?: AgentAuthConfig;
  status: 'generating' | 'active' | 'error';
  toolCount: number;
  callCount: number;
  createdAt?: string;
}

/** Runtime auth injection config. Secrets are read from env vars, not stored. */
export interface AgentAuthConfig {
  type: 'apiKey' | 'bearer' | 'basic';
  envVarName: string;
  location?: 'header' | 'query';
  name?: string;
}

/** Maps an MCP tool call to the underlying REST API call */
export interface ProxyHandler {
  toolName: string;
  method: string;
  pathTemplate: string;
  queryParams: string[];
  pathParams: string[];
  bodyParams: string[];
  headers: Record<string, string>;
}

/** API route request/response types */
export interface GenerateRequest {
  specUrl?: string;
  specJson?: Record<string, unknown>;
  credentialEnvVar?: string;
  credentialName?: string;
  credentialLocation?: 'header' | 'query';
}

export interface GenerateResponse {
  success: boolean;
  agent?: GeneratedAgent;
  error?: string;
}

export interface ToolCallRequest {
  toolName: string;
  arguments: Record<string, unknown>;
}

export interface ToolCallResponse {
  success: boolean;
  result?: unknown;
  error?: string;
  latencyMs?: number;
}
