// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Vercel AI SDK v6 — UI Message Stream Encoder
 *
 * Converts `AsyncIterable<TextStreamPart<ToolSet>>` (the internal ObjectStack
 * streaming format) into the Vercel AI SDK v6 **UI Message Stream Protocol**.
 *
 * Wire format: Server-Sent Events (SSE) with JSON payloads.
 *   `data: {"type":"text-delta","id":"0","delta":"Hello"}\n\n`
 *
 * The client-side `DefaultChatTransport` from `ai` v6 uses
 * `parseJsonEventStream` to parse these SSE events.
 *
 * @see https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol
 */

import type { TextStreamPart, ToolSet } from 'ai';

// ── SSE helpers ──────────────────────────────────────────────────────

function sse(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Encode a single `TextStreamPart` event into SSE-formatted UI Message
 * Stream chunk(s).
 *
 * Returns an empty string for event types that have no wire-format mapping.
 */
export function encodeStreamPart(part: TextStreamPart<ToolSet>): string {
  switch (part.type) {
    // ── Text ──────────────────────────────────────────────────
    case 'text-delta':
      return sse({ type: 'text-delta', id: '0', delta: part.text });

    // ── Tool calling ─────────────────────────────────────────
    case 'tool-input-start':
      return sse({
        type: 'tool-input-start',
        toolCallId: part.id,
        toolName: part.toolName,
      });

    case 'tool-input-delta':
      return sse({
        type: 'tool-input-delta',
        toolCallId: part.id,
        inputTextDelta: part.delta,
      });

    case 'tool-call':
      return sse({
        type: 'tool-input-available',
        toolCallId: part.toolCallId,
        toolName: part.toolName,
        input: part.input,
      });

    case 'tool-result':
      return sse({
        type: 'tool-output-available',
        toolCallId: part.toolCallId,
        output: part.output,
      });

    // ── Finish / Step ────────────────────────────────────────
    case 'finish-step':
      return sse({ type: 'finish-step' });

    case 'finish':
      return sse({
        type: 'finish',
        finishReason: part.finishReason,
      });

    // ── Error ────────────────────────────────────────────────
    case 'error':
      return sse({
        type: 'error',
        errorText: String(part.error),
      });

    // ── Unhandled types (silently skip) ──────────────────────
    default:
      return '';
  }
}

/**
 * Transform an `AsyncIterable<TextStreamPart>` into an `AsyncIterable<string>`
 * where each yielded string is an SSE-formatted UI Message Stream chunk.
 *
 * Emits the required `start`, `start-step`, `text-start` preamble and
 * `text-end`, `finish-step`, `finish`, `[DONE]` postamble automatically.
 */
export async function* encodeVercelDataStream(
  events: AsyncIterable<TextStreamPart<ToolSet>>,
): AsyncIterable<string> {
  // Preamble
  yield sse({ type: 'start' });
  yield sse({ type: 'start-step' });
  yield sse({ type: 'text-start', id: '0' });

  let finishReason = 'stop';

  for await (const part of events) {
    if (part.type === 'finish') {
      finishReason = part.finishReason ?? 'stop';
    }
    const frame = encodeStreamPart(part);
    if (frame) {
      yield frame;
    }
  }

  // Postamble — text-end + finish-step + finish are already emitted by
  // encodeStreamPart when the corresponding parts arrive from the LLM.
  // However, we always need text-end and the [DONE] sentinel.
  yield sse({ type: 'text-end', id: '0' });
  // finish-step and finish may have already been emitted; emit them
  // again only as safeguards — the client handles duplicates gracefully.
  yield sse({ type: 'finish-step' });
  yield sse({ type: 'finish', finishReason });
  yield 'data: [DONE]\n\n';
}
