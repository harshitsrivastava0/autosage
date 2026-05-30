import type { RecommendationResponse, ComparisonResult } from "@/types";

export class ParseError extends Error {
  constructor(message: string, public readonly raw: string) {
    super(message);
    this.name = "ParseError";
  }
}

/** Strip markdown code fences and extract the JSON object/array */
function extractJson(raw: string): string {
  // Remove ```json ... ``` or ``` ... ``` fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Try to find the first { ... } block if no fences
  const braceStart = raw.indexOf("{");
  if (braceStart !== -1) {
    // Find matching closing brace by counting nesting
    let depth = 0;
    for (let i = braceStart; i < raw.length; i++) {
      if (raw[i] === "{") depth++;
      else if (raw[i] === "}") {
        depth--;
        if (depth === 0) return raw.slice(braceStart, i + 1);
      }
    }
  }

  return raw.trim();
}

/**
 * Parse raw Claude text into a RecommendationResponse.
 * Handles markdown fences, extracts first JSON block, validates structure.
 */
export function parseRecommendationJSON(raw: string): RecommendationResponse {
  const jsonStr = extractJson(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    throw new ParseError(`JSON.parse failed: ${String(err)}`, raw);
  }

  const obj = parsed as Record<string, unknown>;

  if (!Array.isArray(obj.shortlist) || obj.shortlist.length === 0) {
    throw new ParseError("Response missing non-empty shortlist array", raw);
  }

  return {
    shortlist: obj.shortlist as RecommendationResponse["shortlist"],
    honourableMentions: Array.isArray(obj.honourableMentions)
      ? (obj.honourableMentions as RecommendationResponse["honourableMentions"])
      : [],
    summary: String(obj.summary ?? ""),
    budgetInsight: String(obj.budgetInsight ?? ""),
    cityNote: String(obj.cityNote ?? ""),
  };
}

/**
 * Parse raw Claude text into a ComparisonResult.
 * Same strip+parse pattern as parseRecommendationJSON.
 */
export function parseComparisonJSON(raw: string): ComparisonResult {
  const jsonStr = extractJson(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    throw new ParseError(`JSON.parse failed: ${String(err)}`, raw);
  }

  const obj = parsed as Record<string, unknown>;

  return {
    verdict: String(obj.verdict ?? ""),
    winnerCarId: (obj.winnerCarId as string | null) ?? null,
    categories: Array.isArray(obj.categories)
      ? (obj.categories as ComparisonResult["categories"])
      : [],
    whoShouldBuy: (obj.whoShouldBuy as Record<string, string>) ?? {},
    priceVerdictNote: String(obj.priceVerdictNote ?? ""),
  };
}
