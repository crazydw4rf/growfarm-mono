import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v3";

import { McpService } from "./server";

type InferZodShape<T extends z.ZodRawShape> = z.infer<z.ZodObject<T>>;

export interface FunctionTool<TArgs extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  description: string;
  schema: z.ZodObject<TArgs>;
  callback: (this: McpService, args: InferZodShape<TArgs>) => ReturnType<ToolCallback>;
}

export function ToolBuilder<Args extends z.ZodRawShape = z.ZodRawShape>(
  name: string,
  description: string,
  schema: z.ZodObject<Args> | null,
  callback: (this: McpService, args: InferZodShape<Args>) => ReturnType<ToolCallback>,
): FunctionTool {
  // @ts-expect-error: biasa type error
  return { name, description, schema: !schema ? {} : schema.shape, callback };
}
