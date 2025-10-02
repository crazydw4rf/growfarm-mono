/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import { zFarmCreate, zFarmGetMany, zFarmUpdate } from "@/models";
import { type LoggingService } from "@/services/logger";
import { LoggingServiceSym } from "@/types";
import type { ExtendedRequest, ExtendedResponse } from "@/types/express";
import { FarmUsecase } from "@/usecase";
import { httpResponse, ValidatePayload, ValidateQuery } from "@/utils";

@injectable("Singleton")
export class FarmController {
  private logger: Logger;

  constructor(
    @inject(FarmUsecase) private readonly farmUc: FarmUsecase,
    @inject(LoggingServiceSym) private readonly loggerInstance: LoggingService,
  ) {
    this.logger = this.loggerInstance.withLabel("FarmController");

    this.createNewFarm = this.createNewFarm.bind(this);
    this.updateFarm = this.updateFarm.bind(this);
    this.getFarmsByProject = this.getFarmsByProject.bind(this);
  }

  @ValidatePayload(zFarmCreate)
  public async createNewFarm(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    const [farm, err] = await this.farmUc.newFarm(req.params.projectId, req.body);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.CREATED, farm);
  }

  @ValidatePayload(zFarmUpdate)
  public async updateFarm(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    this.logger.debug("updating farm", req.body);
    const [farm, err] = await this.farmUc.updateFarm(req.params.farmId, req.body);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, farm);
  }

  @ValidateQuery(zFarmGetMany)
  public async getFarmsByProject(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    const [farms, err] = await this.farmUc.getFarmsByProject(req.params.projectId, res.locals.query);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, farms);
  }

  public deleteFarm = async (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> => {
    const [ok, err] = await this.farmUc.deleteFarm(req.params.farmId);
    if (!ok || err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, { message: "farm deleted" });
  };

  public getFarmById = async (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> => {
    const [farm, err] = await this.farmUc.getFarmById(req.params.farmId);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, farm);
  };

  public getFarmByProjectAndId = async (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> => {
    const [farm, err] = await this.farmUc.getFarmByProjectAndId(req.params.projectId, req.params.farmId);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, farm);
  };
}
