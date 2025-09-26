/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";
import { z } from "zod/v4";

import { zProjectCreate, zProjectGetMany, zProjectUpdate } from "@/models";
import { LoggingService } from "@/services/logger";
import type { ExtendedRequest, ExtendedResponse } from "@/types/express";
import { ProjectUsecase } from "@/usecase";
import { httpResponse, ValidateParams, ValidatePayload, ValidateQuery } from "@/utils";

@injectable("Singleton")
export class ProjectController {
  private logger: Logger;

  constructor(
    @inject(ProjectUsecase) private readonly projectUc: ProjectUsecase,
    @inject(LoggingService) private readonly loggerInstance: LoggingService
  ) {
    this.logger = this.loggerInstance.withLabel("ProjectController");

    this.createNewProject = this.createNewProject.bind(this);
    this.updateProject = this.updateProject.bind(this);
    this.getProjects = this.getProjects.bind(this);
    this.getProjectById = this.getProjectById.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
  }

  @ValidatePayload(zProjectCreate)
  public async createNewProject(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    const [project, err] = await this.projectUc.newProject(res.locals.user.id, req.body);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.CREATED, project);
  }

  @ValidatePayload(zProjectUpdate)
  @ValidateParams("projectId", z.ulid())
  public async updateProject(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    this.logger.debug("updating project", req.body);
    const [project, err] = await this.projectUc.updateProject(req.params.projectId, req.body);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, project);
  }

  @ValidateQuery(zProjectGetMany)
  public async getProjects(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    this.logger.debug("getting projects", { userId: res.locals.user.id, query: req.query });
    const [projects, err] = await this.projectUc.getProjectMany(res.locals.user.id, res.locals.query);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, projects);
  }

  @ValidateParams("projectId", z.ulid())
  public async deleteProject(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    const [ok, err] = await this.projectUc.deleteProject(req.params.projectId);
    if (!ok || err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, { message: "project deleted" });
  }

  @ValidateParams("projectId", z.ulid())
  public async getProjectById(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    const [project, err] = await this.projectUc.getProjectById(req.params.projectId);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, project);
  }
}
