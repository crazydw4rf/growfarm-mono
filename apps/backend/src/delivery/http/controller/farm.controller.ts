/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import { zFarmCreate, zFarmGetMany, zFarmUpdate } from "@/models";
import { LoggingService } from "@/services/logger";
import type { ExtendedRequest, ExtendedResponse } from "@/types/express";
import { FarmUsecase } from "@/usecase";
import { httpResponse, ValidatePayload, ValidateQuery } from "@/utils";

@injectable("Singleton")
export class FarmController {
  private _logger: Logger;

  constructor(
    @inject(FarmUsecase) private readonly _farmUc: FarmUsecase,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService
  ) {
    this._logger = this._loggerInstance.withLabel("FarmController");

    this.createNewFarm = this.createNewFarm.bind(this);
    this.updateFarm = this.updateFarm.bind(this);
    this.getFarmsByProject = this.getFarmsByProject.bind(this);
  }

  @ValidatePayload(zFarmCreate)
  public async createNewFarm(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    const [farm, err] = await this._farmUc.newFarm(req.body);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.CREATED, farm);
  }

  @ValidatePayload(zFarmUpdate)
  public async updateFarm(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    this._logger.debug("updating farm", req.body);
    const [farm, err] = await this._farmUc.updateFarm(req.params.farmId, req.body);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, farm);
  }

  @ValidateQuery(zFarmGetMany)
  public async getFarmsByProject(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    const [farms, err] = await this._farmUc.getFarmsByProject(req.params.projectId, res.locals.query);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, farms);
  }

  public deleteFarm = async (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> => {
    const [ok, err] = await this._farmUc.deleteFarm(req.params.farmId);
    if (!ok || err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, { message: "farm deleted" });
  };

  public getFarmById = async (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> => {
    const [farm, err] = await this._farmUc.getFarmById(req.params.farmId);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, farm);
  };

  public getFarmByProjectAndId = async (
    req: ExtendedRequest,
    res: ExtendedResponse,
    next: NextFunction
  ): Promise<void> => {
    const [farm, err] = await this._farmUc.getFarmByProjectAndId(req.params.projectId, req.params.farmId);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, farm);
  };
}
