import type { NextRequest } from 'next/server';

// Runtime proxy (not `rewrites`) so API_INTERNAL_URL is read per request, not at build time.
export const dynamic = 'force-dynamic';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  // fetch() transparently decodes the body, so these no longer describe it:
  'content-length',
  'content-encoding',
]);

type Ctx = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, { params }: Ctx): Promise<Response> {
  const { path } = await params;
  const base = (process.env.API_INTERNAL_URL ?? 'http://localhost:3001').replace(/\/+$/, '');
  const target = `${base}/api/v1/${path.map(encodeURIComponent).join('/')}${new URL(req.url).search}`;

  const headers = new Headers();
  const cookie = req.headers.get('cookie');
  const contentType = req.headers.get('content-type');
  const origin = req.headers.get('origin');
  const clientIp = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip');
  if (cookie) headers.set('cookie', cookie);
  if (contentType) headers.set('content-type', contentType);
  // The API checks Origin against WEB_ORIGIN on writes, so pass it through unchanged.
  if (origin) headers.set('origin', origin);
  // Preserve the client IP so the API's per-IP login throttling is not shared by every user.
  if (clientIp) headers.set('x-forwarded-for', clientIp);
  headers.set('accept', req.headers.get('accept') ?? 'application/json');

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      redirect: 'manual',
      cache: 'no-store',
    });
  } catch {
    return Response.json({ statusCode: 502, message: 'API unavailable', error: 'Bad Gateway' }, { status: 502 });
  }

  const out = new Headers();
  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (!HOP_BY_HOP.has(k) && k !== 'set-cookie') out.append(key, value);
  });
  for (const c of upstream.headers.getSetCookie()) out.append('set-cookie', c);

  const noBody = upstream.status === 204 || upstream.status === 205 || upstream.status === 304;
  return new Response(noBody ? null : upstream.body, { status: upstream.status, headers: out });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
