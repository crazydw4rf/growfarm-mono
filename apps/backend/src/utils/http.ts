import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ErrorCause } from "@/types/errors";
import type { ResponseBody } from "@/types/http";

import { Merror } from "./merror";

export function httpResponse<T extends object | any[]>(res: Response, code: number, body: ResponseBody<T>): void {
  if (body.data) {
    res.status(code).json(body);
    return;
  }

  res.status(code).json({ data: body, code });
}

export function httpResponseString(res: Response, code: number, body: string, isJson = false): void {
  if (isJson) {
    res.setHeader("Content-Type", "application/json");
    res.status(code).send(body);
    return;
  }

  res.status(code).send(body);
}

export function httpError(res: Response, err: Merror): void {
  const root = err.root;

  const message = root?.error.message ?? "An unexpected error occurred";
  switch (root?.error.cause) {
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
