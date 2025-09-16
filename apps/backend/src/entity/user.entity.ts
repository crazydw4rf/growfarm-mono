import type { User } from "@/generated/prisma/client";

export type { User } from "@/generated/prisma/client";

export type UserWithToken = User & { access_token: string; refresh_token: string };
