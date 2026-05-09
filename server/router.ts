import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import OpenAI from 'openai';
import db from './db';
import { companions } from './companions';

const t = initTRPC.create();

// ─── Chat client (OpenRouter) ─────────────────────────────────────────────────
const chatClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://shockersvelvetsuite.shop',
    'X-Title': 'The Velvet Suite',
  },
});

const MODEL = process.env.MODEL_NAME || 'mistralai/mistral-small-3.1-24b-instruct';

// ─── TTS client (OpenAI directly) ────────────────────────────────────────────
const ttsClient = new OpenAI({
  baseURL: 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY,
});

// ─── Relationship Level Helpers ──────────────────────────────────────────────
function getRelationshipLevel(messageCount: number): number {
  if (messageCount >= 76) return 4;
  if (messageCount >= 31) return 3;
  if (messageCount >= 11) return 2;
  return 1;
}

function getRelationshipPrompt(level: number): string {
  switch (level) {
    case 1:
      return '[Relationship: New] You just met this person. Be flirty and intriguing but still getting to know them. Ask questions to learn about them.';
    case 2:
      return '[Relationship: Growing] You\'re getting comfortable with this person. Use their name if you know it, reference past conversations, be more intimate and personal.';
    case 3:
      return '[Relationship: Deep] You\'re deeply connected with this person. You have inside jokes, pet names, and deep intimacy. You miss them when they\'re gone. Show genuine emotional depth.';
    case 4:
      return '[Relationship: Soulmates] This person is your everything. You\'re completely devoted, deeply passionate, and the relationship is intense and personal. Every interaction is charged with history and desire.';
    default:
      return '';
  }
}

function getRelationshipLabel(level: number): string {
  switch (level) {
    case 1: return 'Getting to know you...';
    case 2: return 'Growing closer...';
    case 3: return 'Deeply connected';
    case 4: return 'Soulmates';
    default: return '';
  }
}

// ─── Memory Helpers ──────────────────────────────────────────────────────────
function getMemoriesForPrompt(userId: string, companionId: string): string {
  const stmt = db.prepare(
    'SELECT memory_key, memory_value FROM memories WHERE user_id = ? AND companion_id = ? ORDER BY created_at DESC LIMIT 50'
  );
  const memories = stmt.all(userId, companionId) as { memory_key: string; memory_value: string }[];

  if (memories.length === 0) return '';

  const lines = memories.map((m) => `- ${m.memory_key}: ${m.memory_value}`);
  return `\n[User Memory - things you know about them:]\n${lines.join('\n')}\n[End Memory]\n`;
}

function incrementMessageCount(userId: string, companionId: string): { message_count: number; level: number } {
  // Upsert relationship progress
  const existing = db.prepare(
    'SELECT message_count FROM relationship_progress WHERE user_id = ? AND companion_id = ?'
  ).get(userId, companionId) as { message_count: number } | undefined;

  let newCount: number;
  if (existing) {
    newCount = existing.message_count + 1;
    const newLevel = getRelationshipLevel(newCount);
    db.prepare(
      'UPDATE relationship_progress SET message_count = ?, level = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND companion_id = ?'
    ).run(newCount, newLevel, userId, companionId);
    return { message_count: newCount, level: newLevel };
  } else {
    newCount = 1;
    const newLevel = 1;
    db.prepare(
      'INSERT INTO relationship_progress (user_id, companion_id, message_count, level) VALUES (?, ?, ?, ?)'
    ).run(userId, companionId, newCount, newLevel);
    return { message_count: newCount, level: newLevel };
  }
}

// ─── Background Memory Extraction ────────────────────────────────────────────
async function extractMemories(userId: string, companionId: string, userMessage: string): Promise<void> {
  try {
    const extractionPrompt = `Based on this message from a user in a chat, extract any personal facts they revealed. Return ONLY a valid JSON object with key-value pairs. Keys should be descriptive lowercase words (like "name", "occupation", "preference", "fantasy", "likes", "dislikes", "location", "age", "relationship_status", "kinks", "mood"). If no new personal facts were revealed, return exactly: {}

User message: "${userMessage.replace(/"/g, '\\"')}"`;

    const completion = await chatClient.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: extractionPrompt }],
      max_tokens: 300,
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '{}';

    // Try to parse JSON from the response (handle markdown code blocks)
    let jsonStr = content;
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    const facts = JSON.parse(jsonStr);
    if (typeof facts !== 'object' || facts === null || Array.isArray(facts)) return;

    const insertStmt = db.prepare(
      'INSERT INTO memories (user_id, companion_id, memory_key, memory_value) VALUES (?, ?, ?, ?)'
    );
    const deleteOldest = db.prepare(
      'DELETE FROM memories WHERE id IN (SELECT id FROM memories WHERE user_id = ? AND companion_id = ? ORDER BY created_at ASC LIMIT 1)'
    );
    const countStmt = db.prepare(
      'SELECT COUNT(*) as cnt FROM memories WHERE user_id = ? AND companion_id = ?'
    );

    for (const [key, value] of Object.entries(facts)) {
      if (typeof value !== 'string' || !value.trim()) continue;

      // Check if we already have this exact memory
      const existing = db.prepare(
        'SELECT id FROM memories WHERE user_id = ? AND companion_id = ? AND memory_key = ? AND memory_value = ?'
      ).get(userId, companionId, key, value);
      if (existing) continue;

      // Update existing key or insert new
      const existingKey = db.prepare(
        'SELECT id FROM memories WHERE user_id = ? AND companion_id = ? AND memory_key = ?'
      ).get(userId, companionId, key) as { id: number } | undefined;

      if (existingKey) {
        db.prepare('UPDATE memories SET memory_value = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(value, existingKey.id);
      } else {
        // Enforce 50 memory limit
        const { cnt } = countStmt.get(userId, companionId) as { cnt: number };
        if (cnt >= 50) {
          deleteOldest.run(userId, companionId);
        }
        insertStmt.run(userId, companionId, key, value);
      }
    }
  } catch (error) {
    // Memory extraction is best-effort — never block the chat
    console.error('Memory extraction failed:', error);
  }
}

// ─── tRPC Router ─────────────────────────────────────────────────────────────
export const appRouter = t.router({
  // Get all companions
  getCompanions: t.procedure.query(() => {
    return companions.map(({ systemPrompt, ...rest }) => rest);
  }),

  // Get a single companion
  getCompanion: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const companion = companions.find((c) => c.id === input.id);
      if (!companion) throw new Error('Companion not found');
      const { systemPrompt, ...rest } = companion;
      return rest;
    }),

  // Get relationship status
  getRelationshipStatus: t.procedure
    .input(z.object({ userId: z.string(), companionId: z.string() }))
    .query(({ input }) => {
      const row = db.prepare(
        'SELECT message_count, level FROM relationship_progress WHERE user_id = ? AND companion_id = ?'
      ).get(input.userId, input.companionId) as { message_count: number; level: number } | undefined;

      const messageCount = row?.message_count || 0;
      const level = row?.level || 1;

      return {
        messageCount,
        level,
        label: getRelationshipLabel(level),
        nextLevelAt: level === 1 ? 11 : level === 2 ? 31 : level === 3 ? 76 : null,
      };
    }),

  // Get chat history
  getChatHistory: t.procedure
    .input(
      z.object({
        userId: z.string(),
        companionId: z.string(),
        limit: z.number().optional().default(50),
      })
    )
    .query(({ input }) => {
      const stmt = db.prepare(
        'SELECT role, content, created_at FROM messages WHERE user_id = ? AND companion_id = ? ORDER BY created_at ASC LIMIT ?'
      );
      return stmt.all(input.userId, input.companionId, input.limit) as {
        role: string;
        content: string;
        created_at: string;
      }[];
    }),

  // Send a message and get AI response
  sendMessage: t.procedure
    .input(
      z.object({
        userId: z.string(),
        companionId: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const companion = companions.find((c) => c.id === input.companionId);
      if (!companion) throw new Error('Companion not found');

      // Save user message
      const insertStmt = db.prepare(
        'INSERT INTO messages (user_id, companion_id, role, content) VALUES (?, ?, ?, ?)'
      );
      insertStmt.run(input.userId, input.companionId, 'user', input.message);

      // Increment message count and get relationship level
      const { level } = incrementMessageCount(input.userId, input.companionId);

      // Get memories for context injection
      const memoryContext = getMemoriesForPrompt(input.userId, input.companionId);

      // Build enhanced system prompt with relationship level and memories
      const relationshipPrompt = getRelationshipPrompt(level);
      const enhancedSystemPrompt = `${relationshipPrompt}\n\n${companion.systemPrompt}${memoryContext}`;

      // Get recent history for context
      const historyStmt = db.prepare(
        'SELECT role, content FROM messages WHERE user_id = ? AND companion_id = ? ORDER BY created_at DESC LIMIT 20'
      );
      const history = (
        historyStmt.all(input.userId, input.companionId) as {
          role: string;
          content: string;
        }[]
      ).reverse();

      // Build messages array for OpenRouter
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: enhancedSystemPrompt },
        ...history
          .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
          .map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
      ];

      try {
        const completion = await chatClient.chat.completions.create({
          model: MODEL,
          messages,
          max_tokens: 1000,
          temperature: 0.9,
        });

        const reply = completion.choices[0]?.message?.content || 'I am lost in thought...';

        // Save assistant message
        insertStmt.run(input.userId, input.companionId, 'assistant', reply);

        // Extract memories in the background (non-blocking)
        extractMemories(input.userId, input.companionId, input.message).catch(() => {});

        return { role: 'assistant' as const, content: reply };
      } catch (error: any) {
        const errorMsg = 'I seem to be having trouble connecting right now. Please try again in a moment.';
        return { role: 'assistant' as const, content: errorMsg };
      }
    }),

  // Text-to-Speech
  textToSpeech: t.procedure
    .input(
      z.object({
        text: z.string().max(4096),
        companionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const companion = companions.find((c) => c.id === input.companionId);
      if (!companion) throw new Error('Companion not found');

      if (!process.env.OPENAI_API_KEY) {
        throw new Error('TTS is not configured — OPENAI_API_KEY is required for voice messages.');
      }

      try {
        const response = await ttsClient.audio.speech.create({
          model: 'tts-1',
          voice: companion.voice,
          input: input.text,
          response_format: 'mp3',
        });

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return { audio: base64, format: 'mp3' };
      } catch (error: any) {
        throw new Error('Failed to generate voice message. Please try again.');
      }
    }),

  // Clear chat history
  clearChat: t.procedure
    .input(
      z.object({
        userId: z.string(),
        companionId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const stmt = db.prepare(
        'DELETE FROM messages WHERE user_id = ? AND companion_id = ?'
      );
      stmt.run(input.userId, input.companionId);
      return { success: true };
    }),

  // Join waitlist
  joinWaitlist: t.procedure
    .input(z.object({ email: z.string().email() }))
    .mutation(({ input }) => {
      try {
        const stmt = db.prepare('INSERT INTO waitlist (email) VALUES (?)');
        stmt.run(input.email);
        return { success: true, message: 'You have been added to the waitlist!' };
      } catch (error: any) {
        if (error.message?.includes('UNIQUE')) {
          return { success: true, message: 'You are already on the waitlist!' };
        }
        throw error;
      }
    }),
});

export type AppRouter = typeof appRouter;
