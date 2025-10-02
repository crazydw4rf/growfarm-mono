import z from "zod";

import type { Farm } from "@/entity";
import type { ZodPartial } from "@/types/helper";

export type { FarmDelegate as FarmModel } from "@/generated/prisma/models";

export const zFarmCreate = z.object({
  farm_name: z.string().regex(/^(?!.*[\p{Emoji}]).*$/u, "farm name cannot contain emojis"),
  location: z.string().min(1, "location is required"),
  land_size: z.coerce.number().positive("land size must be a positive number"),
  product_price: z.number().positive("product price must be a positive number"),
  comodity: z.string().min(1, "commodity is required"),
  farm_status: z.enum(["ACTIVE", "HARVESTED"]).default("ACTIVE"),
  soil_type: z
    .enum(["ORGANOSOL", "ANDOSOL", "LITOSOL", "REGOSOL", "VERTISOL", "ALUVIAL", "MEDISOL", "PODZOLIK", "GRUMUSOL", "KAMBISOL"])
    .default("ORGANOSOL"),
  planted_at: z.coerce.date().default(new Date()),
  target_harvest_date: z.coerce.date(),
  actual_harvest_date: z.coerce.date().optional(),
  total_harvest: z.number().nonnegative("total harvest must be a non-negative number").optional(),
  farm_budget: z.number().nonnegative(),
  decription: z.string().max(1000).optional(),
} satisfies ZodPartial<Farm>);

export const zFarmUpdate = zFarmCreate.partial();

export const zFarmGetMany = z.object({
  skip: z.coerce.number().min(0).default(0),
  take: z.coerce.number().min(1).max(20).default(5),
});

export type FarmCreateDto = z.infer<typeof zFarmCreate>;

export type FarmUpdateDto = z.infer<typeof zFarmUpdate>;

export type FarmGetManyDto = z.infer<typeof zFarmGetMany>;
