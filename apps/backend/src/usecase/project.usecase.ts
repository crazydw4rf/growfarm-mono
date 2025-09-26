import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { Project, ProjectReportMany, ProjectReportOne } from "@/entity";
import type { GenProjectReportDto, ProjectCreateDto, ProjectUpdateDto } from "@/models";
import { type IProjectRepository, ProjectRepository } from "@/repository";
import { LoggingService } from "@/services/logger";
import type { PaginatedObject, Result } from "@/types/helper";
import { Err, Ok } from "@/utils";

export interface IProjectUsecase {
  newProject(userId: string, dto: ProjectCreateDto): Promise<Result<Project>>;
  updateProject(id: string, dto: ProjectUpdateDto): Promise<Result<Project>>;
  deleteProject(id: string): Promise<Result<boolean>>;
  getProjectById(id: string): Promise<Result<Project>>;
  getProjectMany(userId: string, page: { skip?: number; take?: number }): Promise<Result<PaginatedObject<Project[]>>>;
  genProjectReportId(id: string): Promise<Result<ProjectReportOne[]>>;
  genProjectReportByDate(userId: string, dto: GenProjectReportDto): Promise<Result<ProjectReportMany[]>>;
}

@injectable("Singleton")
export class ProjectUsecase implements IProjectUsecase {
  private logger: Logger;

  constructor(
    @inject(ProjectRepository) private readonly projectRepo: IProjectRepository,
    @inject(LoggingService) private readonly loggerInstance: LoggingService
  ) {
    this.logger = this.loggerInstance.withLabel("ProjectUsecase");
  }

  async newProject(userId: string, dto: ProjectCreateDto): Promise<Result<Project>> {
    this.logger.debug("creating new project", dto);

    const [project, err] = await this.projectRepo.create(dto, userId);
    if (err) {
      return Err(err);
    }

    return Ok(project);
  }

  async updateProject(id: string, dto: ProjectUpdateDto): Promise<Result<Project>> {
    this.logger.debug("updating project", dto);

    const [project, err] = await this.projectRepo.update(id, dto);
    if (err) {
      return Err(err);
    }

    return Ok(project);
  }

  async getProjectById(id: string): Promise<Result<Project>> {
    const [project, err] = await this.projectRepo.get(id);
    if (err) {
      return Err(err);
    }

    return Ok(project);
  }

  async getProjectMany(userId: string, page: { skip?: number; take?: number }): Promise<Result<PaginatedObject<Project[]>>> {
    const [projects, err] = await this.projectRepo.getManyPaginated(userId, page);
    if (err) {
      return Err(err);
    }

    return Ok(projects);
  }

  async deleteProject(id: string): Promise<Result<boolean>> {
    const [ok, err] = await this.projectRepo.delete(id);
    if (!ok || err) {
      return Err(err);
    }

    return Ok(true);
  }

  async genProjectReportId(id: string): Promise<Result<ProjectReportOne[]>> {
    const [reports, err] = await this.projectRepo.getProjectReportSummary(id);
    if (err) {
      return Err(err);
    }

    return Ok(reports);
  }

  async genProjectReportByDate(userId: string, dto: GenProjectReportDto): Promise<Result<ProjectReportMany[]>> {
    const [reports, err] = await this.projectRepo.getProjectReportSummaryByDate(userId, dto.start_date, dto.end_date);
    if (err) {
      return Err(err);
    }

    return Ok(reports);
  }
}
