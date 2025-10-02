import z from "zod";

import type { User } from "@/entity";
import type { ZodPartial } from "@/types/helper";

export type { UserDelegate as UserModel } from "@/generated/prisma/models";

const zName = z
  .string()
  .max(128, "user name must be at most 255 characters long")
  .regex(/^(?!.*[\p{Emoji}\d]).*$/u, "user name must not contain emojis or numbers");

export const zCreateUser = z.object({
  first_name: zName,
  last_name: zName,
  email: z.email("email must be a valid email address"),
  password: z.string().min(8, "password must be at least 8 characters long"),
} satisfies ZodPartial<User>);

export const zLoginUser = zCreateUser.pick({ email: true, password: true });

export type UserRegisterDto = z.infer<typeof zCreateUser>;

export type UserLoginDto = z.infer<typeof zLoginUser>;
