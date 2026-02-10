// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { NextRequest, NextResponse } from 'next/server';
import { type ObjectKernel, HttpDispatcher, HttpDispatcherResult } from '@objectstack/runtime';

export interface NextAdapterOptions {
  kernel: ObjectKernel;
  prefix?: string;
}

/**
 * Creates a route handler for Next.js App Router
 * Handles /api/[...objectstack] pattern
 */
export function createRouteHandler(options: NextAdapterOptions) {
  const dispatcher = new HttpDispatcher(options.kernel);
  const error = (msg: string, code: number = 500) => NextResponse.json({ success: false, error: { message: msg, code } }, { status: code });

  // Helper to convert DispatchResult to NextResponse
  const toResponse = (result: HttpDispatcherResult) => {
      if (result.handled) {
          if (result.response) {
               return NextResponse.json(result.response.body, { 
                   status: result.response.status, 
                   headers: result.response.headers 
               });
          }
          if (result.result) {
              const res = result.result;
              // Redirect
              if (res.type === 'redirect' && res.url) {
                  return NextResponse.redirect(res.url);
              }
              // Stream
              if (res.type === 'stream' && res.stream) {
                  return new NextResponse(res.stream, {
                      status: 200,
                      headers: res.headers
                  });
              }
              // If it's a standard response object (like from another fetch)
              // Next.js might handle it, or we return it directly
              return res; 
          }
      }
      return error('Not Found', 404);
  }

  return async function handler(req: NextRequest, { params }: { params: { objectstack: string[] } }) {
    const resolvedParams = await Promise.resolve(params);
    const segments = resolvedParams.objectstack || [];
    const method = req.method;
    
    // --- 0. Discovery Endpoint ---
    if (segments.length === 0 && method === 'GET') {
      return NextResponse.json({ data: dispatcher.getDiscoveryInfo(options.prefix || '/api') });
    }

    try {
        const rawRequest = req;

        // --- 1. Auth ---
        if (segments[0] === 'auth') {
           // Try AuthPlugin service first (preferred path)
           const authService = typeof options.kernel.getService === 'function'
             ? options.kernel.getService('auth')
             : null;

           if (authService && typeof authService.handleRequest === 'function') {
             const response = await authService.handleRequest(req);
             // Convert Web Response to NextResponse
             const body = await response.text();
             const headers: Record<string, string> = {};
             response.headers.forEach((v: string, k: string) => { headers[k] = v; });
             return new NextResponse(body, { status: response.status, headers });
           }

           // Fallback to legacy dispatcher
           const subPath = segments.slice(1).join('/');
           const body = method === 'POST' ? await req.json().catch(() => ({})) : {};
           const result = await dispatcher.handleAuth(subPath, method, body, { request: req });
           return toResponse(result);
        }

        // --- 2. GraphQL ---
        if (segments[0] === 'graphql' && method === 'POST') {
            const body = await req.json();
            const result = await dispatcher.handleGraphQL(body as any, { request: rawRequest } as any);
            return NextResponse.json(result);
        }

        // --- 3. Metadata ---
        if (segments[0] === 'meta') {
            const subPath = segments.slice(1).join('/');
            
            let body: any = undefined;
            if (method === 'PUT' || method === 'POST') {
                body = await req.json().catch(() => ({}));
            }

            const result = await dispatcher.handleMetadata(subPath, { request: rawRequest }, method, body);
            return toResponse(result);
        }

        // --- 4. Data ---
        if (segments[0] === 'data') {
            const subPath = segments.slice(1).join('/');
            let body: any = {};
            if (method === 'POST' || method === 'PATCH') {
                body = await req.json().catch(() => ({}));
            }
            
            // Extract query params
            const url = new URL(req.url);
            const queryParams: Record<string, any> = {};
            url.searchParams.forEach((val, key) => queryParams[key] = val);

            const result = await dispatcher.handleData(subPath, method, body, queryParams, { request: rawRequest } as any);
            return toResponse(result);
        }

        // --- 5. Storage ---
        if (segments[0] === 'storage') {
            const subPath = segments.slice(1).join('/');
            
            let file: any = undefined;
            if (method === 'POST' && subPath === 'upload') {
                const formData = await req.formData();
                file = formData.get('file');
            }

            const result = await dispatcher.handleStorage(subPath, method, file, { request: rawRequest });
            return toResponse(result);
        }
        
        return error('Not Found', 404);

    } catch (err: any) {
        return error(err.message || 'Internal Server Error', err.statusCode || 500);
    }
  }
}

/**
 * Creates a discovery handler for Next.js App Router
 * Handles /.well-known/objectstack
 */
export function createDiscoveryHandler(options: NextAdapterOptions) {
  return async function discoveryHandler(req: NextRequest) {
      const apiPath = options.prefix || '/api';
      const url = new URL(req.url);
      const targetUrl = new URL(apiPath, url.origin);
      return NextResponse.redirect(targetUrl);
  }
}
