import z from "zod";

import type { Project } from "@/entity";
import type { ZodPartial } from "@/types/helper";

export const zProjectCreate = z.object({
  project_name: z.string().regex(/^(?!.*[\p{Emoji}]).*$/u, "project name cannot contain emojis"),
  budget: z.number().min(0, "budget must be a non-negative number"),
  project_status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED"]).default("PLANNING"),
  start_date: z.coerce.date().default(new Date()),
  target_date: z.coerce.date(),
  actual_end_date: z.coerce.date().optional(),
  description: z.string().max(1000).optional(),
} satisfies ZodPartial<Project>);

export const zProjectUpdate = zProjectCreate.partial();

export const zProjectGetMany = z.object({
  skip: z.coerce.number().min(0).default(0),
  take: z.coerce.number().min(1).max(20).default(5),
});

export type ProjectCreateDto = z.infer<typeof zProjectCreate>;

export type ProjectUpdateDto = z.infer<typeof zProjectUpdate>;

export type ProjectGetManyDto = z.infer<typeof zProjectGetMany>;
