import { NextRequest, NextResponse } from "next/server";

const SVG_PLACEHOLDER: Record<string, string> = {
  hatchback: "/cars/hatchback-placeholder.svg",
  sedan: "/cars/sedan-placeholder.svg",
  suv: "/cars/suv-placeholder.svg",
  muv: "/cars/muv-placeholder.svg",
  ev: "/cars/ev-placeholder.svg",
};

/**
 * GET /api/car-image?make=X&model=Y&bodyType=Z
 *
 * Attempts a HEAD request to the stimg.cardekho.com CDN using common URL
 * patterns for the given make/model. On success, returns a 302 redirect to
 * the CDN URL so the browser fetches the image directly. On failure (network
 * error or non-2xx), returns a 302 redirect to the appropriate SVG placeholder.
 *
 * This route is a fallback for the 27 SVG cars that don't have verified CDN
 * URLs baked into the dataset. Dataset cars with known URLs use imageUrl
 * directly and bypass this route entirely.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const make = searchParams.get("make") ?? "";
  const model = searchParams.get("model") ?? "";
  const bodyType = searchParams.get("bodyType") ?? "suv";

  const fallback = SVG_PLACEHOLDER[bodyType] ?? SVG_PLACEHOLDER.suv;

  if (!make || !model) {
    return NextResponse.redirect(new URL(fallback, req.nextUrl.origin));
  }

  // Normalise make/model to CDN slug format (Title-Case, spaces → hyphens)
  const slug = (s: string) =>
    s
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("-");

  const makeSlug = slug(make);
  const modelSlug = slug(model);

  const candidates = [
    `https://stimg.cardekho.com/images/carexteriorimages/630x420/${makeSlug}/${modelSlug}/front-left-side-47.jpg`,
    `https://stimg.cardekho.com/images/carexteriorimages/630x420/${makeSlug}/${modelSlug}-2024/front-left-side-47.jpg`,
    `https://stimg.cardekho.com/images/carexteriorimages/630x420/${makeSlug}/${modelSlug}-2023/front-left-side-47.jpg`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return NextResponse.redirect(url, 302);
      }
    } catch {
      // Continue to next candidate or fall through to SVG
    }
  }

  return NextResponse.redirect(new URL(fallback, req.nextUrl.origin));
}
