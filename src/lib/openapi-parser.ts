// =============================================================================
// OmniMCP — OpenAPI Parser
// Fetches, validates, and normalizes an OpenAPI 3.x spec into a ParsedAPI object
// =============================================================================

import type { ParsedAPI, ParsedEndpoint, ParsedParameter, ParsedRequestBody } from './types';

/**
 * Fetches and parses an OpenAPI specification from a URL or raw JSON.
 * Returns a normalized ParsedAPI object ready for MCP generation.
 */
export async function parseOpenAPISpec(
  input: string | Record<string, unknown>
): Promise<ParsedAPI> {
  let spec: Record<string, unknown>;

  if (typeof input === 'string') {
    // Fetch spec from URL
    const response = await fetch(input, {
      headers: { 'Accept': 'application/json, application/yaml, text/yaml' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    try {
      spec = JSON.parse(text);
    } catch {
      // Try YAML parsing (simplified — handle common YAML patterns)
      throw new Error(
        'Could not parse spec as JSON. Please provide a JSON-format OpenAPI spec URL.'
      );
    }
  } else {
    spec = input;
  }

  // Validate it's an OpenAPI spec
  const version = (spec.openapi as string) || (spec.swagger as string);
  if (!version) {
    throw new Error('Invalid OpenAPI spec: missing "openapi" or "swagger" version field');
  }

  // Extract info
  const info = spec.info as Record<string, string> || {};
  const servers = spec.servers as Array<{ url: string }> || [];
  const paths = spec.paths as Record<string, Record<string, unknown>> || {};

  // Determine base URL
  let baseUrl = '';
  if (servers.length > 0) {
    baseUrl = servers[0].url;
    // Handle relative URLs
    if (baseUrl.startsWith('/') && typeof input === 'string') {
      const url = new URL(input);
      baseUrl = `${url.protocol}//${url.host}${baseUrl}`;
    }
  } else if (spec.host) {
    // Swagger 2.0
    const scheme = (spec.schemes as string[])?.[0] || 'https';
    const basePath = (spec.basePath as string) || '';
    baseUrl = `${scheme}://${spec.host}${basePath}`;
  }

  // Parse security schemes for auth detection
  const securitySchemes = getSecuritySchemes(spec);
  const authInfo = detectAuthType(securitySchemes);

  // Parse all endpoints
  const endpoints: ParsedEndpoint[] = [];
  const httpMethods = ['get', 'post', 'put', 'delete', 'patch'] as const;

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    for (const method of httpMethods) {
      const operation = (pathItem as Record<string, unknown>)[method] as Record<string, unknown>;
      if (!operation) continue;

      const endpoint = parseEndpoint(path, method.toUpperCase() as ParsedEndpoint['method'], operation, spec);
      endpoints.push(endpoint);
    }
  }

  return {
    title: info.title || 'Untitled API',
    description: info.description || '',
    version: info.version || '1.0.0',
    baseUrl,
    endpoints,
    authType: authInfo.type,
    authDetails: authInfo.details,
  };
}

/**
 * Parse a single endpoint operation into a normalized format.
 */
function parseEndpoint(
  path: string,
  method: ParsedEndpoint['method'],
  operation: Record<string, unknown>,
  spec: Record<string, unknown>
): ParsedEndpoint {
  const parameters: ParsedParameter[] = [];

  // Parse parameters
  const rawParams = (operation.parameters as Array<Record<string, unknown>>) || [];
  for (const param of rawParams) {
    const resolved = resolveRef(param, spec);
    parameters.push({
      name: (resolved.name as string) || '',
      in: (resolved.in as ParsedParameter['in']) || 'query',
      description: (resolved.description as string) || '',
      required: (resolved.required as boolean) || false,
      type: getSchemaType(resolved.schema as Record<string, unknown> || resolved),
      enum: (resolved.schema as Record<string, unknown>)?.enum as string[] || resolved.enum as string[],
      default: (resolved.schema as Record<string, unknown>)?.default || resolved.default,
    });
  }

  // Parse request body (OpenAPI 3.x)
  let requestBody: ParsedRequestBody | undefined;
  if (operation.requestBody) {
    const body = resolveRef(operation.requestBody as Record<string, unknown>, spec);
    const content = body.content as Record<string, Record<string, unknown>>;
    if (content) {
      const contentType = Object.keys(content)[0] || 'application/json';
      const mediaType = content[contentType];
      requestBody = {
        description: (body.description as string) || '',
        required: (body.required as boolean) || false,
        contentType,
        schema: resolveRef((mediaType?.schema as Record<string, unknown>) || {}, spec),
      };
    }
  }

  // Parse response schema
  let responseSchema: Record<string, unknown> | undefined;
  const responses = operation.responses as Record<string, Record<string, unknown>>;
  if (responses) {
    const successResponse = responses['200'] || responses['201'] || responses.default;
    if (successResponse) {
      const resolved = resolveRef(successResponse, spec);
      const content = resolved.content as Record<string, Record<string, unknown>>;
      if (content) {
        const mediaType = content['application/json'];
        if (mediaType?.schema) {
          responseSchema = resolveRef(mediaType.schema as Record<string, unknown>, spec);
        }
      }
    }
  }

  // Generate operationId if missing
  const operationId = (operation.operationId as string) ||
    generateOperationId(method, path);

  return {
    path,
    method,
    operationId,
    summary: (operation.summary as string) || '',
    description: (operation.description as string) || '',
    parameters,
    requestBody,
    responseSchema,
    tags: (operation.tags as string[]) || [],
  };
}

/**
 * Resolve a $ref reference in the spec.
 */
function resolveRef(
  obj: Record<string, unknown>,
  spec: Record<string, unknown>
): Record<string, unknown> {
  if (!obj || !obj.$ref) return obj;

  const refPath = (obj.$ref as string).replace('#/', '').split('/');
  let current: unknown = spec;

  for (const segment of refPath) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return obj; // Can't resolve, return original
    }
  }

  if (current && typeof current === 'object') {
    return current as Record<string, unknown>;
  }
  return obj;
}

/**
 * Get the type string from a JSON Schema object.
 */
function getSchemaType(schema: Record<string, unknown> | undefined): string {
  if (!schema) return 'string';
  if (schema.type) return schema.type as string;
  if (schema.enum) return 'string';
  if (schema.properties) return 'object';
  if (schema.items) return 'array';
  return 'string';
}

/**
 * Generate a meaningful operationId from method + path.
 */
function generateOperationId(method: string, path: string): string {
  const cleanPath = path
    .replace(/[{}]/g, '')
    .replace(/\//g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '');
  return `${method.toLowerCase()}_${cleanPath}`.replace(/_+/g, '_');
}

/**
 * Extract security schemes from the spec.
 */
function getSecuritySchemes(
  spec: Record<string, unknown>
): Record<string, Record<string, unknown>> {
  // OpenAPI 3.x
  const components = spec.components as Record<string, unknown>;
  if (components?.securitySchemes) {
    return components.securitySchemes as Record<string, Record<string, unknown>>;
  }

  // Swagger 2.0
  if (spec.securityDefinitions) {
    return spec.securityDefinitions as Record<string, Record<string, unknown>>;
  }

  return {};
}

/**
 * Detect the primary auth type from security schemes.
 */
function detectAuthType(
  schemes: Record<string, Record<string, unknown>>
): { type: ParsedAPI['authType']; details?: ParsedAPI['authDetails'] } {
  const entries = Object.values(schemes);
  if (entries.length === 0) return { type: 'none' };

  const primary = entries[0];
  const type = primary.type as string;

  if (type === 'apiKey') {
    return {
      type: 'apiKey',
      details: {
        headerName: primary.in === 'header' ? (primary.name as string) : undefined,
        queryParamName: primary.in === 'query' ? (primary.name as string) : undefined,
      },
    };
  }

  if (type === 'http') {
    const scheme = primary.scheme as string;
    if (scheme === 'bearer') return { type: 'bearer' };
    if (scheme === 'basic') return { type: 'basic' };
  }

  if (type === 'oauth2') return { type: 'oauth2' };

  return { type: 'none' };
}
