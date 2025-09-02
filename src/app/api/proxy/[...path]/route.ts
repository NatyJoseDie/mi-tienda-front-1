import { NextRequest, NextResponse } from 'next/server';

// Force dynamic to avoid caching of proxy responses at the route level
export const dynamic = 'force-dynamic';

// Prefer a private server-side var if present; fallback to the public one to reduce env churn
const BASE_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

function buildTargetUrl(req: NextRequest, pathSegments: string[]): string {
  if (!BASE_URL) {
    throw new Error('Missing BACKEND_URL or NEXT_PUBLIC_API_URL env var');
  }

  // Ensure we don't end up with double slashes
  const base = BASE_URL.replace(/\/$/, '');
  const path = pathSegments.join('/');

  const reqUrl = new URL(req.url);
  const search = reqUrl.search; // includes leading "?" or ''

  return `${base}/${path}${search}`;
}

function filterRequestHeaders(headers: Headers): Headers {
  const forward = new Headers();
  headers.forEach((value, key) => {
    const k = key.toLowerCase();
    // Strip hop-by-hop and Next specific headers
    if (
      k === 'host' ||
      k === 'connection' ||
      k === 'keep-alive' ||
      k === 'transfer-encoding' ||
      k === 'upgrade' ||
      k === 'accept-encoding' || // let the upstream decide
      k === 'content-length' // will be set automatically by fetch
    ) {
      return;
    }
    forward.set(key, value);
  });
  return forward;
}

function filterResponseHeaders(headers: Headers): Headers {
  const filtered = new Headers();
  headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === 'transfer-encoding' || k === 'connection') return;
    filtered.set(key, value);
  });
  // Ensure we don't cache proxied responses unless backend explicitly says so
  if (!filtered.has('cache-control')) {
    filtered.set('cache-control', 'no-store');
  }
  return filtered;
}

// Next 15 types: the context argument is a Promise you must await
type RouteCtx = { params: Promise<{ path: string[] }> };

async function handler(req: NextRequest, { params }: RouteCtx) {
  const resolvedParams = await params;
  try {
    const method = req.method.toUpperCase();
    const targetUrl = buildTargetUrl(req, resolvedParams.path || []);

    const headers = filterRequestHeaders(req.headers);
    // Add forwarding headers
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    headers.set('x-forwarded-for', ip);
    headers.set('x-forwarded-proto', 'https');

    let body: BodyInit | undefined = undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      // Preserve raw body to support JSON, form-data, etc.
      const buf = await req.arrayBuffer().catch(() => undefined);
      if (buf && buf.byteLength > 0) body = buf;
    }

    const upstreamResponse = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: 'manual',
    });

    const respHeaders = filterResponseHeaders(upstreamResponse.headers);
    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: respHeaders,
    });
  } catch (err: any) {
    const message = err?.message || 'Proxy error';
    return NextResponse.json(
      { error: 'Bad Gateway', message },
      { status: 502, headers: { 'cache-control': 'no-store' } }
    );
  }
}

// Export explicit handlers to satisfy Next.js type inference
export async function GET(req: NextRequest, ctx: RouteCtx) {
  return handler(req, ctx);
}
export async function POST(req: NextRequest, ctx: RouteCtx) {
  return handler(req, ctx);
}
export async function PUT(req: NextRequest, ctx: RouteCtx) {
  return handler(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  return handler(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  return handler(req, ctx);
}
export async function OPTIONS(req: NextRequest, ctx: RouteCtx) {
  return handler(req, ctx);
}