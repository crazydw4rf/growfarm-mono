/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { UserWithToken } from "@/entity";
import { zLoginUser } from "@/models";
import { ConfigService, LoggingService } from "@/services";
import type { ExtendedRequest, ExtendedResponse } from "@/types";
import { AuthUsecase } from "@/usecase";
import { httpResponse, sanitizeUser } from "@/utils";
import { ValidatePayload } from "@/utils";

@injectable("Singleton")
export class AuthController {
  private logger: Logger;

  constructor(
    @inject(AuthUsecase) private readonly authUc: AuthUsecase,
    @inject(ConfigService) private readonly config: ConfigService,
    @inject(LoggingService) private readonly loggerInstance: LoggingService,
  ) {
    this.logger = this.loggerInstance.withLabel("AuthController");

    this.loginUser = this.loginUser.bind(this);
  }

  @ValidatePayload(zLoginUser)
  async loginUser(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    this.logger.debug("login user", { ...req.body, password: undefined });
    const [user, err] = await this.authUc.login(req.body);
    if (err) {
      next(err);
      return;
    }

    this.setRefreshTokenCookie(res, user);

    httpResponse(res, StatusCodes.OK, sanitizeUser(user));
  }

  public refreshToken = async (_req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> => {
    const [user, err] = await this.authUc.refreshToken(res.locals.user.id);
    if (err) {
      next(err);
      return;
    }

    this.setRefreshTokenCookie(res, user);

    httpResponse(res, StatusCodes.OK, sanitizeUser(user));
  };

  public logoutUser = (_req: ExtendedRequest, res: ExtendedResponse, _next: NextFunction): void => {
    this.logger.debug("logging out user", res.locals.user);
    res.cookie("refresh_token", "0", {
      domain: ".".concat(this.config.get("DOMAIN_NAME")),
      path: "/v1/auth/refresh",
      maxAge: -1,
    });

    res.sendStatus(StatusCodes.NO_CONTENT);
  };

  protected setRefreshTokenCookie(res: Response, user: UserWithToken): void {
    res.cookie("refresh_token", user.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      domain: ".".concat(this.config.get("DOMAIN_NAME")),
      path: "/v1/auth/refresh",
      maxAge: 60 * 60 * 24 * 30 * 1000, // 1 bulan
    });
  }
}
