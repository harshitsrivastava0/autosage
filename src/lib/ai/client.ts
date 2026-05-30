/**
 * Anthropic Claude API client wrapper.
 *
 * Two modes:
 *   bufferCompletion — collect full response text (used by recommend + compare)
 *   createStream     — async iterable of text deltas (used by chat)
 *
 * Both apply prompt caching (cache_control: ephemeral) to the system message,
 * reducing latency and cost on repeated identical system prompts.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

const MODEL = "claude-sonnet-4-6";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ConfigError("ANTHROPIC_API_KEY not set");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

/**
 * Returns the full assistant response text in a single awaited call.
 * Used for structured JSON responses where we need the complete output
 * before parsing (recommend, compare routes).
 */
export async function bufferCompletion(
  system: string,
  messages: MessageParam[]
): Promise<string> {
  const client = getClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: system,
        // Prompt caching: system prompt is stable across requests
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock ? (textBlock as { type: "text"; text: string }).text : "";
}

/**
 * Returns an async iterable of text delta strings.
 * Used by the chat streaming route to pipe tokens to the client as SSE.
 */
export async function* createStream(
  system: string,
  messages: MessageParam[]
): AsyncIterable<string> {
  const client = getClient();

  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: system,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
