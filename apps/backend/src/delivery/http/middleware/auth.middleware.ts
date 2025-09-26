/* eslint-disable @typescript-eslint/dot-notation */
import type { NextFunction, Response } from "express";
import { inject, injectable } from "inversify";
import jwt, { TokenExpiredError } from "jsonwebtoken";

import { ConfigService } from "@/services/config";
import { AppError, ErrorCause } from "@/types/errors";
import type { ExtendedRequest } from "@/types/express";
import { isValidPayloadObject } from "@/utils";

@injectable("Singleton")
export class AuthMiddleware {
  constructor(@inject(ConfigService) private readonly config: ConfigService) {}

  // TODO: implement refesh token versioning and invalidation
  verifyJWT = (req: ExtendedRequest, res: Response, next: NextFunction): void => {
    const authToken = req.get("Authorization")?.split(" ")[1]; // Authorization: Bearer <token>
    if (!authToken) {
      next(AppError.new("token not found or expired", ErrorCause.AUTHORIZATION_ERROR));
      return;
    }

    try {
      const token = jwt.verify(authToken, this.config.env.JWT_ACCESS_SECRET, { complete: true });
      if (isValidPayloadObject(token.payload)) {
        res.locals.user = { id: token.payload.sub };
        next();
        return;
      }

      next(AppError.new("invalid token payload", ErrorCause.VALIDATION_ERROR));
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        next(AppError.new("token expired", ErrorCause.AUTHORIZATION_ERROR));
        return;
      }

      next(AppError.new("unknown error occurred while verifying token", ErrorCause.VALIDATION_ERROR));
    }
  };

  verifyRefreshJWT = (req: ExtendedRequest, res: Response, next: NextFunction): void => {
    const token = req.cookies["refresh_token"] as string | undefined;
    if (!token) {
      next(AppError.new("refresh token not found or expired", ErrorCause.AUTHORIZATION_ERROR));
      return;
    }

    try {
      const decoded = jwt.verify(token, this.config.env.JWT_REFRESH_SECRET, { complete: true });
      if (isValidPayloadObject(decoded.payload)) {
        res.locals.user = { id: decoded.payload.sub };
        next();
        return;
      }

      next(AppError.new("invalid token payload", ErrorCause.VALIDATION_ERROR));
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        next(AppError.new("refresh token expired", ErrorCause.AUTHORIZATION_ERROR));
        return;
      }

      next(AppError.new("unknown error occurred while verifying token", ErrorCause.VALIDATION_ERROR));
    }
  };
}
