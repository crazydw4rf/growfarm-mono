import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ErrorCause } from "@/types/errors";

import type Merror from "./merror";

export interface HttpResponse {
  data?: any;
  error?: string;
  code?: number;
}

export function httpResponse(res: Response, code: number, data: object): void {
  res.status(code).json({ data, code });
}

export function httpError(res: Response, err: Merror): void {
  const rootError = err.root;

  const message = rootError?.error.message ?? "An unexpected error occurred";
  switch (rootError?.error.cause) {
    case ErrorCause.DUPLICATE_ENTRY:
      httpResponse(res, StatusCodes.CONFLICT, { error: message });
      return;
    case ErrorCause.ENTRY_NOT_FOUND:
      httpResponse(res, StatusCodes.NOT_FOUND, { error: message });
      return;
    case ErrorCause.DATABASE_ERROR:
      httpResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { error: "database error occurred" });
      return;
    case ErrorCause.CREDENTIALS_ERROR:
    case ErrorCause.AUTHORIZATION_ERROR:
      httpResponse(res, StatusCodes.UNAUTHORIZED, { error: message });
      return;
    case ErrorCause.VALIDATION_ERROR:
      httpResponse(res, StatusCodes.BAD_REQUEST, { error: message });
      return;
    default:
      httpResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { error: "unknown error occurred" });
      return;
  }
}
