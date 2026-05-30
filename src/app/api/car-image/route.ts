import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/car-image?url=<encoded-cdn-url>
 *
 * Proxies stimg.cardekho.com image bytes through Vercel, spoofing a
 * Referer header so the CDN doesn't block the request. Without this,
 * the CDN returns 403 when the browser fetches directly from a Vercel domain.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || !url.startsWith("https://stimg.cardekho.com/")) {
    return new NextResponse("Invalid url param", { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        Referer: "https://www.cardekho.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!upstream.ok) {
      return new NextResponse("CDN fetch failed", { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("Proxy error", { status: 502 });
  }
}
