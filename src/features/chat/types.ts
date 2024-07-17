import { z } from "zod";

export const SYSTEM = "system";
export const USER = "user";
export const ASSISTANT = "assistant";
export const FUNCTION = "function";
export const roleShema = z.enum([SYSTEM, USER, ASSISTANT, FUNCTION]);
// Create zod schema for ChatMessage
export const chatMessageSchema = z.object({
  id: z.string(),
  role: roleShema,
  content: z.string(),
  isPreamble: z.optional(z.boolean()),
  isImportant: z.optional(z.boolean()),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatSchema = z.object({
  id: z.string(),
  summary: z.string(),
  botTyping: z.boolean(),
  botTypingMessage: z.nullable(
    z.object({
      role: z.optional(roleShema),
      content: z.optional(z.string()),
    })
  ),
  draft: z.string(),
  history: z.record(chatMessageSchema),
});

export type Chat = z.infer<typeof chatSchema>;

export type ChatState = {
  activeId: string | null;
  chats: Record<string, Chat>;
};

export const NEW_CHAT_DEFAULT = "New Chat";
