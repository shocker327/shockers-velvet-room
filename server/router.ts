import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import OpenAI from 'openai';
import db from './db';
import { companions } from './companions';

const t = initTRPC.create();

// ─── Chat client (OpenRouter) ─────────────────────────────────────────────────
// OpenRouter is OpenAI-API-compatible — just swap baseURL and key.
// Falls back to OPENAI_API_KEY if OPENROUTER_API_KEY is not set.
const chatClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://shockersvelvetsuite.shop',
    'X-Title': 'The Velvet Suite',
  },
});

// Model can be overridden via MODEL_NAME env var; defaults to an
// uncensored Mistral model available on OpenRouter.
const MODEL = process.env.MODEL_NAME || 'mistralai/mistral-small-3.1-24b-instruct';

// ─── TTS client (OpenAI directly) ────────────────────────────────────────────
// OpenRouter does not support TTS, so we call OpenAI's TTS API directly.
// Requires OPENAI_API_KEY env var.
const ttsClient = new OpenAI({
  baseURL: 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY,
});

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

      // Build messages array for OpenRouter.
      // The system prompt is always the FIRST message with role "system".
      // Conversation history follows as alternating user/assistant turns.
      // The system message is never injected into the user turn — keeping
      // them separate prevents the model from echoing the instructions back.
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: companion.systemPrompt },
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

        return { role: 'assistant' as const, content: reply };
      } catch (error: any) {
        const errorMsg = 'I seem to be having trouble connecting right now. Please try again in a moment.';
        return { role: 'assistant' as const, content: errorMsg };
      }
    }),

  // ─── Text-to-Speech ───────────────────────────────────────────────────────
  // Generates audio from text using OpenAI's TTS API.
  // Returns base64-encoded MP3 audio.
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

        // Convert the response to a buffer then base64
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
