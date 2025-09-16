import type { JwtPayload } from "jsonwebtoken";

import type { User, UserWithToken } from "@/entity";
import { AppError, ErrorCause } from "@/types/errors";
import type { Result } from "@/types/helper";

import Merror from "./merror";

export function Err(error: Merror | Error): Result<any, Merror> {
  if (error instanceof Merror) {
    return [undefined, error];
  } else if (error instanceof Error) {
    return [undefined, Merror.new(error)];
  }

  return [undefined, Merror.new(AppError.new("unknown error", ErrorCause.UNKNOWN_ERROR))];
}

export function Ok<T>(ok: T): Result<T, any> {
  return [ok, undefined];
}

export function isValidPayloadObject(o: string | JwtPayload): o is JwtPayload & { sub: string; role: string } {
  if (typeof o === "string") {
    return false;
  }

  return Object.hasOwn(o, "sub") || Object.hasOwn(o, "role");
}

export function sanitizeUser<T extends User>(user: T): T & UserWithToken {
  return {
    ...user,
    password_hash: undefined,
    token: undefined,
    id: undefined,
    refresh_token: undefined,
  };
}
