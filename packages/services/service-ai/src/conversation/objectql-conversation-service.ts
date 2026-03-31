// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { randomUUID } from 'node:crypto';
import type {
  AIConversation,
  AIMessage,
  IAIConversationService,
  IDataEngine,
} from '@objectstack/spec/contracts';

/** Object names used for persistence. */
const CONVERSATIONS_OBJECT = 'ai_conversations';
const MESSAGES_OBJECT = 'ai_messages';

/** Database row shape for ai_conversations. */
interface DbConversationRow {
  id: string;
  title: string | null;
  agent_id: string | null;
  user_id: string | null;
  metadata: string | null;
  created_at: string;
  updated_at: string;
}

/** Database row shape for ai_messages. */
interface DbMessageRow {
  id: string;
  conversation_id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls: string | null;
  tool_call_id: string | null;
  created_at: string;
}

/** Deterministic ordering for conversations (total order). */
const CONVERSATION_ORDER = [
  { field: 'created_at', order: 'asc' as const },
  { field: 'id', order: 'asc' as const },
];

/** Deterministic ordering for messages within a conversation. */
const MESSAGE_ORDER = [
  { field: 'created_at', order: 'asc' as const },
  { field: 'id', order: 'asc' as const },
];

/**
 * ObjectQLConversationService — Persistent implementation of IAIConversationService.
 *
 * Delegates all storage to an {@link IDataEngine} instance, using the
 * `ai_conversations` and `ai_messages` objects. This decouples the service
 * from any specific database driver (Turso, Postgres, SQLite, etc.).
 *
 * Production environments should use this implementation to ensure
 * conversation history survives service restarts.
 */
export class ObjectQLConversationService implements IAIConversationService {
  private readonly engine: IDataEngine;

  constructor(engine: IDataEngine) {
    this.engine = engine;
  }

  async create(options: {
    title?: string;
    agentId?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  } = {}): Promise<AIConversation> {
    const now = new Date().toISOString();
    const id = `conv_${randomUUID()}`;

    const record = {
      id,
      title: options.title ?? null,
      agent_id: options.agentId ?? null,
      user_id: options.userId ?? null,
      metadata: options.metadata ? JSON.stringify(options.metadata) : null,
      created_at: now,
      updated_at: now,
    };

    await this.engine.insert(CONVERSATIONS_OBJECT, record);

    return {
      id,
      title: options.title,
      agentId: options.agentId,
      userId: options.userId,
      messages: [],
      createdAt: now,
      updatedAt: now,
      metadata: options.metadata,
    };
  }

  async get(conversationId: string): Promise<AIConversation | null> {
    const row: DbConversationRow | null = await this.engine.findOne(CONVERSATIONS_OBJECT, {
      where: { id: conversationId },
    });

    if (!row) return null;

    const messages: DbMessageRow[] = await this.engine.find(MESSAGES_OBJECT, {
      where: { conversation_id: conversationId },
      orderBy: MESSAGE_ORDER,
    });

    return this.toConversation(row, messages);
  }

  async list(options: {
    userId?: string;
    agentId?: string;
    limit?: number;
    cursor?: string;
  } = {}): Promise<AIConversation[]> {
    const where: Record<string, unknown> = {};
    if (options.userId) where.user_id = options.userId;
    if (options.agentId) where.agent_id = options.agentId;

    // Stable cursor-based pagination using composite (created_at, id) order.
    // This avoids skips/duplicates when multiple conversations share a timestamp.
    if (options.cursor) {
      const cursorRow = await this.engine.findOne(CONVERSATIONS_OBJECT, {
        where: { id: options.cursor },
        fields: ['created_at', 'id'],
      });
      if (cursorRow) {
        where.$or = [
          { created_at: { $gt: cursorRow.created_at } },
          { created_at: cursorRow.created_at, id: { $gt: cursorRow.id } },
        ];
      }
    }

    const rows: DbConversationRow[] = await this.engine.find(CONVERSATIONS_OBJECT, {
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: CONVERSATION_ORDER,
      limit: options.limit && options.limit > 0 ? options.limit : undefined,
    });

    // Load messages per conversation in parallel.
    // N+1 is bounded by the pagination limit; driver-agnostic $in is not guaranteed.
    const conversations: AIConversation[] = await Promise.all(
      rows.map(async (row) => {
        const messages: DbMessageRow[] = await this.engine.find(MESSAGES_OBJECT, {
          where: { conversation_id: row.id },
          orderBy: MESSAGE_ORDER,
        });
        return this.toConversation(row, messages);
      }),
    );

    return conversations;
  }

  async addMessage(conversationId: string, message: AIMessage): Promise<AIConversation> {
    // Verify conversation exists
    const row: DbConversationRow | null = await this.engine.findOne(CONVERSATIONS_OBJECT, {
      where: { id: conversationId },
    });
    if (!row) {
      throw new Error(`Conversation "${conversationId}" not found`);
    }

    const now = new Date().toISOString();
    const msgId = `msg_${randomUUID()}`;

    // Insert the message
    await this.engine.insert(MESSAGES_OBJECT, {
      id: msgId,
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      tool_calls: message.toolCalls ? JSON.stringify(message.toolCalls) : null,
      tool_call_id: message.toolCallId ?? null,
      created_at: now,
    });

    // Update conversation timestamp
    await this.engine.update(CONVERSATIONS_OBJECT, { id: conversationId, updated_at: now }, {
      where: { id: conversationId },
    });

    // Return the full updated conversation
    return (await this.get(conversationId))!;
  }

  async delete(conversationId: string): Promise<void> {
    // Delete messages first (child records)
    await this.engine.delete(MESSAGES_OBJECT, {
      where: { conversation_id: conversationId },
      multi: true,
    });

    // Delete the conversation
    await this.engine.delete(CONVERSATIONS_OBJECT, {
      where: { id: conversationId },
    });
  }

  // ── Private helpers ──────────────────────────────────────────────

  /**
   * Safely parse a JSON string, returning `undefined` on failure.
   */
  private safeParse<T>(value: string | null, fallback?: T): T | undefined {
    if (!value) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  /**
   * Map a database row + message rows to an AIConversation.
   */
  private toConversation(row: DbConversationRow, messageRows: DbMessageRow[]): AIConversation {
    return {
      id: row.id,
      title: row.title ?? undefined,
      agentId: row.agent_id ?? undefined,
      userId: row.user_id ?? undefined,
      messages: messageRows.map(m => this.toMessage(m)),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metadata: this.safeParse<Record<string, unknown>>(row.metadata),
    };
  }

  /**
   * Map a database row to an AIMessage.
   */
  private toMessage(row: DbMessageRow): AIMessage {
    const msg: AIMessage = {
      role: row.role,
      content: row.content,
    };
    const toolCalls = this.safeParse<any[]>(row.tool_calls);
    if (toolCalls) {
      msg.toolCalls = toolCalls;
    }
    if (row.tool_call_id) {
      msg.toolCallId = row.tool_call_id;
    }
    return msg;
  }
}
