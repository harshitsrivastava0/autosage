import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, upsertSession, generateId, isDbDegraded } from "@/lib/db";
import type { CityId } from "@/types";

const CITY_IDS: CityId[] = [
  "delhi", "mumbai", "bangalore", "chennai", "hyderabad",
  "pune", "ahmedabad", "kolkata", "jaipur", "lucknow",
];

/** Zod schema for POST /api/session body */
const PostBodySchema = z.object({
  id: z.string().optional(),
  city: z.enum(CITY_IDS as [CityId, ...CityId[]]).default("delhi"),
  answers: z.record(z.string(), z.unknown()).optional(),
});

/**
 * GET /api/session?id=<sessionId>
 * Returns the session or 404.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  const session = await getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}

/**
 * POST /api/session
 * Body: { id?, city, answers? }
 * Creates a new session or updates an existing one. Returns the session.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PostBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { id = generateId(), city, answers } = parsed.data;

  const session = await upsertSession({
    id,
    city,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    answers: answers as any ?? undefined,
  });

  return NextResponse.json({ ...session, degraded: isDbDegraded() }, { status: 200 });
}
