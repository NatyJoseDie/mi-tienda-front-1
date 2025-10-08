import type { NextRequest } from 'next/server';

// Ensure this route is always dynamic (no static caching by Next.js)
export const dynamic = 'force-dynamic';

// Very small allow-list to prevent SSRF. Adjust if you need to proxy more hosts.
const isAllowedHost = (hostname: string) => {
  // Allow the specific Supabase project host and any subdomain under supabase.co
  return hostname === 'tttjkmkikdyiiahsrhvo.supabase.co' || hostname.endsWith('.supabase.co');
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  // Decode once in case we received an already-encoded value
  let targetUrl = rawUrl;
  try {
    targetUrl = decodeURIComponent(rawUrl);
  } catch (e) {
    console.error('Error decoding URL:', e);
    return new Response(`Error decoding URL: ${rawUrl}`, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch (e) {
    console.error('Invalid URL:', targetUrl, e);
    return new Response(`Invalid URL: ${targetUrl}`, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return new Response(`Invalid protocol: ${parsed.protocol}`, { status: 400 });
  }

  if (!isAllowedHost(parsed.hostname)) {
    return new Response(`Host not allowed: ${parsed.hostname}`, { status: 403 });
  }

  try {
    console.log(`Proxying request to: ${parsed.toString()}`);
    const upstream = await fetch(parsed.toString(), {
      method: 'GET',
      // Avoid caching in dev; if you want, tune this on prod
      cache: 'no-store',
      redirect: 'follow',
      // Do not forward credentials
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      console.error(`Upstream error (${upstream.status}):`, text);
      return new Response(
        text || `Upstream error: ${upstream.status} ${upstream.statusText}`, 
        { 
          status: upstream.status,
          headers: {
            'Content-Type': 'text/plain',
          }
        }
      );
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const headers = new Headers();
    headers.set('Content-Type', contentType);

    if (contentType.startsWith('image/')) {
      headers.set('Cache-Control', 'public, max-age=86400, immutable');
    } else {
      headers.set('Cache-Control', 'no-store');
    }

    // Stream the body through to the client
    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error('proxy-image error:', err);
    return new Response(`Proxy error: ${err instanceof Error ? err.message : String(err)}`, { status: 500 });
  }
}