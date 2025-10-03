import z from "zod";

export const zChatRequest = z.object({
  prompt: z.string().min(1, "prompt is required"),
  locale: z.enum(["id", "en"]).optional().default("id"),
});

export type ChatRequestDto = z.infer<typeof zChatRequest>;

export type ChatResponse = {
  response: string;
};
