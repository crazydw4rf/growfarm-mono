/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { UserWithToken } from "@/entity";
import { zLoginUser } from "@/models";
import { ConfigService } from "@/services/config";
import { LoggingService } from "@/services/logger";
import type { ExtendedRequest, ExtendedResponse } from "@/types/express";
import { AuthUsecase } from "@/usecase";
import { httpResponse, sanitizeUser } from "@/utils";
import { ValidatePayload } from "@/utils/decorator";

@injectable("Singleton")
export class AuthController {
  private _logger: Logger;

  constructor(
    @inject(AuthUsecase) private readonly _authUc: AuthUsecase,
    @inject(ConfigService) private readonly _config: ConfigService,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService,
  ) {
    this._logger = this._loggerInstance.withLabel("AuthController");

    this.loginUser = this.loginUser.bind(this);
  }

  @ValidatePayload(zLoginUser)
  async loginUser(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    this._logger.debug("login user", { ...req.body, password: undefined });
    const [user, err] = await this._authUc.login(req.body);
    if (err) {
      next(err);
      return;
    }

    this.setRefreshTokenCookie(res, user);

    httpResponse(res, StatusCodes.OK, sanitizeUser(user));
  }

  public refreshToken = async (_req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> => {
    const [user, err] = await this._authUc.refreshToken(res.locals.user.id);
    if (err) {
      next(err);
      return;
    }

    this.setRefreshTokenCookie(res, user);

    httpResponse(res, StatusCodes.OK, sanitizeUser(user));
  };

  public logoutUser = (_req: ExtendedRequest, res: ExtendedResponse, _next: NextFunction): void => {
    this._logger.debug("logging out user", res.locals.user);
    res.clearCookie("refresh_token", { path: "/v1/auth/refresh" });

    res.sendStatus(StatusCodes.NO_CONTENT);
  };

  protected setRefreshTokenCookie(res: Response, user: UserWithToken): void {
    res.cookie("refresh_token", user.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      domain: ".".concat(this._config.env.DOMAIN_NAME),
      path: "/v1/auth/refresh",
      maxAge: 60 * 60 * 24 * 30 * 1000, // 1 bulan
    });
  }
}
