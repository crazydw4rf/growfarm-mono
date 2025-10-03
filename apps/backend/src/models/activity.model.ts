import z from "zod";

import type { Activity } from "@/entity";
import type { ZodPartial } from "@/types/helper";

export type { ActivityDelegate as ActivityModel } from "@/generated/prisma/models";

export const zActivityCreate = z.object({
  activity_name: z.string().min(1, "activity name is required").max(255, "activity name is too long"),
  activity_type: z
    .enum([
      "LAND_PREPARATION",
      "PLANTING",
      "FERTILIZING",
      "IRRIGATION",
      "WEEDING",
      "PEST_CONTROL",
      "PRUNING",
      "HARVESTING",
      "POST_HARVEST",
      "MAINTENANCE",
      "OTHER",
    ])
    .default("OTHER"),
  activity_status: z.enum(["NOT_STARTED", "IN_PROGRESS", "DONE"]).default("NOT_STARTED"),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  description: z.string().min(1, "description is required").max(1000, "description is too long"),
} satisfies ZodPartial<Activity>);

export const zActivityUpdate = zActivityCreate.partial();

export const zActivityGetMany = z.object({
  skip: z.coerce.number().min(0).default(0),
  take: z.coerce.number().min(1).max(20).default(10),
});

export type ActivityCreateDto = z.infer<typeof zActivityCreate>;

export type ActivityUpdateDto = z.infer<typeof zActivityUpdate>;

export type ActivityGetManyDto = z.infer<typeof zActivityGetMany>;
