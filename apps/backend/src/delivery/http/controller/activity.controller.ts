/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";
import z from "zod";

import { zActivityCreate, zActivityGetMany, zActivityUpdate } from "@/models";
import { type LoggingService } from "@/services/logger";
import { LoggingServiceSym } from "@/types";
import type { ExtendedRequest, ExtendedResponse } from "@/types/express";
import { FarmUsecase } from "@/usecase";
import { httpResponse, ValidateParams, ValidatePayload, ValidateQuery } from "@/utils";

@injectable("Singleton")
export class ActivityController {
  private logger: Logger;

  constructor(
    @inject(FarmUsecase) private readonly farmUc: FarmUsecase,
    @inject(LoggingServiceSym) private readonly loggerInstance: LoggingService,
  ) {
    this.logger = this.loggerInstance.withLabel("ActivityController");

    this.createActivity = this.createActivity.bind(this);
    this.updateActivity = this.updateActivity.bind(this);
    this.getActivitiesByFarm = this.getActivitiesByFarm.bind(this);
    this.deleteActivity = this.deleteActivity.bind(this);
  }

  @ValidatePayload(zActivityCreate)
  public async createActivity(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    this.logger.debug("creating new activity for farm", { farmId: req.params.farmId });

    const [activity, err] = await this.farmUc.createActivity(req.params.farmId, req.body);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.CREATED, activity);
  }

  @ValidatePayload(zActivityUpdate)
  public async updateActivity(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    this.logger.debug("updating activity", { activityId: req.params.activityId });

    const [activity, err] = await this.farmUc.updateActivity(req.params.activityId, req.body);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, activity);
  }

  @ValidateQuery(zActivityGetMany)
  public async getActivitiesByFarm(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    this.logger.debug("getting activities by farm", { farmId: req.params.farmId });

    const [activities, err] = await this.farmUc.getActivitiesByFarm(req.params.farmId, res.locals.query);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, activities);
  }

  @ValidateParams("activityId", z.ulid())
  public async deleteActivity(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    this.logger.debug("deleting activity", { activityId: req.params.activityId });

    const [activity, err] = await this.farmUc.deleteActivity(req.params.activityId);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, { message: "activity deleted", data: activity });
  }
}
