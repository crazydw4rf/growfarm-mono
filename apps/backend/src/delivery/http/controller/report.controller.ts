/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";
import { ulid } from "zod/v4";

import { zGenProjectReport } from "@/models";
import type { ExtendedRequest, ExtendedResponse } from "@/types/express";
import { ProjectUsecase } from "@/usecase";
import { httpResponseString, ValidateParams, ValidatePayload } from "@/utils";

@injectable("Singleton")
export class ReportController {
  constructor(@inject(ProjectUsecase) private readonly projectUc: ProjectUsecase) {
    this.genProjectReportOne = this.genProjectReportOne.bind(this);
    this.genProjectReportByDate = this.genProjectReportByDate.bind(this);
  }

  @ValidateParams("projectId", ulid())
  public async genProjectReportOne(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    const [reports, err] = await this.projectUc.genProjectReportId(req.params.projectId);
    if (err) {
      next(err);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const reports_ = JSON.stringify(reports, (_, v) => (typeof v === "bigint" ? v.toString() : v));

    httpResponseString(res, StatusCodes.OK, reports_, true);
  }

  @ValidatePayload(zGenProjectReport)
  public async genProjectReportByDate(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    const [reports, err] = await this.projectUc.genProjectReportByDate(res.locals.user.id, req.body);
    if (err) {
      next(err);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const reports_ = JSON.stringify(reports, (_, v) => (typeof v === "bigint" ? v.toString() : v));

    httpResponseString(res, StatusCodes.OK, reports_, true);
  }
}
