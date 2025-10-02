/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import { zCreateUser } from "@/models";
import { type LoggingService } from "@/services/logger";
import { LoggingServiceSym } from "@/types";
import type { ExtendedRequest, ExtendedResponse } from "@/types/express";
import { type IUserUsecase, UserUsecase } from "@/usecase/user.usecase";
import { httpResponse, sanitizeUser, ValidatePayload } from "@/utils";

@injectable("Singleton")
export class UserController {
  private logger: Logger;

  constructor(
    @inject(UserUsecase) private readonly userUc: IUserUsecase,
    @inject(LoggingServiceSym) private readonly loggerInstance: LoggingService,
  ) {
    this.logger = this.loggerInstance.withLabel("UserController");

    this.registerUser = this.registerUser.bind(this);
  }

  @ValidatePayload(zCreateUser)
  public async registerUser(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    const [user, err] = await this.userUc.registerUser(req.body);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.CREATED, sanitizeUser(user));
  }

  public deleteUser = async (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> => {
    throw new Error("Method not implemented.");
  };
  public updateUser = async (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> => {
    throw new Error("Method not implemented.");
  };

  public me = async (_req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> => {
    const [user, err] = await this.userUc.getUserById(res.locals.user.id);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, sanitizeUser(user));
  };
}
