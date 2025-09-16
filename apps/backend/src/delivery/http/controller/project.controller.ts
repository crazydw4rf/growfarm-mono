/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import { zProjectCreate, zProjectGetMany, zProjectUpdate } from "@/models";
import { LoggingService } from "@/services/logger";
import type { ExtendedRequest, ExtendedResponse } from "@/types/express";
import { ProjectUsecase } from "@/usecase";
import { httpResponse, ValidatePayload, ValidateQuery } from "@/utils";

@injectable("Singleton")
export class ProjectController {
  private _logger: Logger;

  constructor(
    @inject(ProjectUsecase) private readonly _projectUc: ProjectUsecase,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService
  ) {
    this._logger = this._loggerInstance.withLabel("ProjectController");

    this.createNewProject = this.createNewProject.bind(this);
    this.updateProject = this.updateProject.bind(this);
    this.getProjects = this.getProjects.bind(this);
  }

  @ValidatePayload(zProjectCreate)
  public async createNewProject(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    const [project, err] = await this._projectUc.newProject(res.locals.user.id, req.body);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.CREATED, project);
  }

  @ValidatePayload(zProjectUpdate)
  public async updateProject(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    this._logger.debug("updating project", req.body);
    const [project, err] = await this._projectUc.updateProject(req.params.projectId, req.body);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, project);
  }

  @ValidateQuery(zProjectGetMany)
  public async getProjects(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    this._logger.debug("getting projects", { userId: res.locals.user.id, query: req.query });
    const [projects, err] = await this._projectUc.getProjectMany(res.locals.user.id, res.locals.query); // Project[]
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, projects);
  }

  public deleteProject = async (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> => {
    const [ok, err] = await this._projectUc.deleteProject(req.params.projectId);
    if (!ok || err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, { message: "project deleted" });
  };

  public getProjectById = async (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> => {
    const [project, err] = await this._projectUc.getProjectById(req.params.projectId);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, project);
  };
}
