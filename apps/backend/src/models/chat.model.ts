import z from "zod";

export const zChatRequest = z.object({
  prompt: z.string().min(1, "prompt is required"),
});

export type ChatRequestDto = z.infer<typeof zChatRequest>;

export type ChatResponse = {
  response: string;
};
