import type { GeneratedAgent } from './types';

export interface ToolExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  latencyMs: number;
  meta?: {
    method: string;
    url: string;
    statusCode: number;
  };
}

export async function executeAgentTool(
  agent: GeneratedAgent,
  toolName: string,
  toolArgs: Record<string, unknown> = {}
): Promise<ToolExecutionResult> {
  const handler = agent.proxyHandlers.find(h => h.toolName === toolName);
  if (!handler) {
    return {
      success: false,
      error: `No proxy handler found for tool: ${toolName}`,
      latencyMs: 0,
    };
  }

  const startTime = Date.now();
  let url = `${agent.baseUrl}${handler.pathTemplate}`;

  for (const param of handler.pathParams) {
    const value = toolArgs[param];
    if (value !== undefined) {
      url = url.replace(`{${param}}`, encodeURIComponent(String(value)));
    }
  }

  const queryParts: string[] = [];
  for (const param of handler.queryParams) {
    const value = toolArgs[param];
    if (value !== undefined) {
      queryParts.push(`${encodeURIComponent(param)}=${encodeURIComponent(String(value))}`);
    }
  }

  if (queryParts.length > 0) {
    url += `?${queryParts.join('&')}`;
  }

  const authHeaders: Record<string, string> = {};
  const authQuery = buildAuthQuery(agent);
  if (authQuery) {
    url += `${url.includes('?') ? '&' : '?'}${authQuery}`;
  }

  const injectedAuthHeaders = buildAuthHeaders(agent);
  if (injectedAuthHeaders) {
    Object.assign(authHeaders, injectedAuthHeaders);
  }

  const fetchOptions: RequestInit = {
    method: handler.method,
    headers: {
      Accept: 'application/json',
      ...authHeaders,
      ...handler.headers,
    },
  };

  if (['POST', 'PUT', 'PATCH'].includes(handler.method) && handler.bodyParams.length > 0) {
    const bodyData: Record<string, unknown> = {};
    for (const param of handler.bodyParams) {
      if (toolArgs[param] !== undefined) {
        bodyData[param] = toolArgs[param];
      }
    }

    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Content-Type': 'application/json',
    };
    fetchOptions.body = JSON.stringify(bodyData);
  }

  const response = await fetch(url, fetchOptions);
  const latencyMs = Date.now() - startTime;
  const contentType = response.headers.get('content-type');
  const result = contentType?.includes('application/json')
    ? await response.json()
    : await response.text();

  const meta = {
    method: handler.method,
    url: redactUrl(url),
    statusCode: response.status,
  };

  if (!response.ok) {
    return {
      success: false,
      error: `API returned ${response.status}: ${response.statusText}`,
      result,
      latencyMs,
      meta,
    };
  }

  return {
    success: true,
    result,
    latencyMs,
    meta,
  };
}

function redactUrl(url: string): string {
  return url
    .replace(/([?&](?:api[_-]?key|key|token|access_token)=)[^&]+/gi, '$1***')
    .replace(/([?&](?:password|secret)=)[^&]+/gi, '$1***');
}

function buildAuthHeaders(agent: GeneratedAgent): Record<string, string> | undefined {
  const config = agent.authConfig;
  if (!config || config.location === 'query') return undefined;

  const secret = process.env[config.envVarName];
  if (!secret) return undefined;

  if (config.type === 'bearer') {
    return { Authorization: `Bearer ${secret}` };
  }

  if (config.type === 'basic') {
    return { Authorization: `Basic ${Buffer.from(secret).toString('base64')}` };
  }

  return { [config.name || 'X-API-Key']: secret };
}

function buildAuthQuery(agent: GeneratedAgent): string | undefined {
  const config = agent.authConfig;
  if (!config || config.location !== 'query') return undefined;

  const secret = process.env[config.envVarName];
  if (!secret) return undefined;

  return `${encodeURIComponent(config.name || 'api_key')}=${encodeURIComponent(secret)}`;
}
