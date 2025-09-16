export type ErrorCause = (typeof ErrorCause)[keyof typeof ErrorCause];

export const ErrorCause = {
  ENTRY_NOT_FOUND: "ENTRY NOT FOUND",
  DATABASE_ERROR: "DATABASE ERROR",
  CACHE_ERROR: "CACHE ERROR",
  CREDENTIALS_ERROR: "CREDENTIALS ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION ERROR",
  UNKNOWN_ERROR: "UNKNOWN ERROR",
  DUPLICATE_ENTRY: "DUPLICATE ENTRY",
  VALIDATION_ERROR: "VALIDATION ERROR",
} as const;

export class AppError extends Error {
  constructor(message: string, cause: ErrorCause = ErrorCause.UNKNOWN_ERROR) {
    super(message, { cause: cause });
  }

  static new(message: string, cause?: ErrorCause): AppError {
    return new AppError(message, cause);
  }
}
