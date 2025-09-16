import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { Project } from "@/entity";
import { type ProjectCreateDto, type ProjectUpdateDto } from "@/models";
import { type IProjectRepository, ProjectRepository } from "@/repository";
import { LoggingService } from "@/services/logger";
import type { Result } from "@/types/helper";
import { Err, Ok } from "@/utils";

export interface IProjectUsecase {
  newProject(userId: string, dto: ProjectCreateDto): Promise<Result<Project>>;
  updateProject(id: string, dto: ProjectUpdateDto): Promise<Result<Project>>;
  deleteProject(id: string): Promise<Result<boolean>>;
  getProjectById(id: string): Promise<Result<Project>>;
  getProjectMany(userId: string, page: { skip?: number; take?: number }): Promise<Result<Project[]>>;
}

@injectable("Singleton")
export class ProjectUsecase implements IProjectUsecase {
  private _logger: Logger;

  constructor(
    @inject(ProjectRepository) private readonly _projectRepo: IProjectRepository,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService
  ) {
    this._logger = this._loggerInstance.withLabel("ProjectUsecase");
  }

  async newProject(userId: string, dto: ProjectCreateDto): Promise<Result<Project>> {
    this._logger.debug("creating new project", dto);

    const [project, err] = await this._projectRepo.create(dto, userId);
    if (err) {
      return Err(err);
    }

    return Ok(project);
  }

  async updateProject(id: string, dto: ProjectUpdateDto): Promise<Result<Project>> {
    this._logger.debug("updating project", dto);

    const [project, err] = await this._projectRepo.update(id, dto);
    if (err) {
      return Err(err);
    }

    return Ok(project);
  }

  async getProjectById(id: string): Promise<Result<Project>> {
    const [project, err] = await this._projectRepo.get(id);
    if (err) {
      return Err(err);
    }

    return Ok(project);
  }

  async getProjectMany(userId: string, page: { skip?: number; take?: number }): Promise<Result<Project[]>> {
    const [projects, err] = await this._projectRepo.getMany(userId, page);
    if (err) {
      return Err(err);
    }

    return Ok(projects);
  }

  async deleteProject(id: string): Promise<Result<boolean>> {
    const [ok, err] = await this._projectRepo.delete(id);
    if (!ok || err) {
      return Err(err);
    }

    return Ok(true);
  }
}
