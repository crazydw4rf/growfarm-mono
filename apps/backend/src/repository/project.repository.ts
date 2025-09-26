import { inject, injectable } from "inversify";

import type { Project, ProjectReportMany, ProjectReportOne, ProjectWithFarms } from "@/entity";
import { Prisma } from "@/generated/prisma/client";
import { aggregateProjectReportBatch, aggregateProjectReportOne } from "@/generated/prisma/sql";
import PrismaService from "@/services/prisma";
import { AppError, ErrorCause } from "@/types/errors";
import type { BaseRepositoryInterface, PaginatedObject, PaginationParameters, Result } from "@/types/helper";
import { Err, Ok } from "@/utils";

export interface IProjectRepository extends BaseRepositoryInterface<Project> {
  getMany(userId: string): Promise<Result<ProjectWithFarms[]>>;
  getManyPaginated(userId: string, page: PaginationParameters): Promise<Result<PaginatedObject<Project[]>>>;
  getByDateRange(id: string, startDate: Date, endDate: Date): Promise<Result<Project[]>>;
  getProjectReportSummary(id: string): Promise<Result<ProjectReportOne[]>>;
  getProjectReportSummaryByDate(userId: string, startDate: Date, endDate: Date): Promise<Result<ProjectReportMany[]>>;
}

@injectable("Singleton")
export class ProjectRepository implements IProjectRepository {
  constructor(@inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(data: Project, userId: string): Promise<Result<Project>> {
    try {
      const project = await this.prisma.project.create({
        data: { ...data, user_id: userId },
      });

      return Ok(project);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async get(id: string): Promise<Result<Project>> {
    try {
      const project = await this.prisma.project.findFirstOrThrow({
        where: { id },
      });
      return Ok(project);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async update(id: string, data: Project): Promise<Result<Project>> {
    try {
      const project = await this.prisma.project.update({
        where: { id },
        data,
      });

      return Ok(project);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async delete(id: string): Promise<Result<boolean>> {
    try {
      await this.prisma.project.delete({
        where: { id },
      });

      return Ok(true);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getMany(userId: string): Promise<Result<ProjectWithFarms[]>> {
    try {
      const projects = await this.prisma.project.findMany({
        where: { user_id: userId },
        include: { farms: true },
      });

      return Ok(projects);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getManyPaginated(userId: string, page: { skip: number; take: number }): Promise<Result<PaginatedObject<Project[]>>> {
    try {
      const [projects, count] = await this.prisma.$transaction([
        this.prisma.project.findMany({
          where: { user_id: userId },
          ...page,
        }),
        this.prisma.project.count({ where: { user_id: userId } }),
      ]);

      return Ok({ data: projects, ...page, count });
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Result<Project[]>> {
    try {
      const projects = await this.prisma.project.findMany({
        where: {
          user_id: userId,
          AND: { start_date: { gte: startDate }, target_date: { lte: endDate } },
        },
      });

      return Ok(projects);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getProjectReportSummary(id: string): Promise<Result<ProjectReportOne[]>> {
    try {
      const results = await this.prisma.$queryRawTyped(aggregateProjectReportOne(id));

      return Ok(results);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getProjectReportSummaryByDate(userId: string, startDate: Date, endDate: Date): Promise<Result<ProjectReportMany[]>> {
    try {
      const results = await this.prisma.$queryRawTyped(aggregateProjectReportBatch(userId, startDate, endDate));

      return Ok(results);
    } catch (e) {
      return this.handleError(e);
    }
  }

  private handleError(e: any): Result<any> {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return Err(AppError.new("project already exists", ErrorCause.DUPLICATE_ENTRY));
      } else if (e.code === "P2025") {
        return Err(AppError.new("project not found", ErrorCause.ENTRY_NOT_FOUND));
      }
      return Err(AppError.new(e.message, ErrorCause.DATABASE_ERROR));
    }
    return Err(AppError.new("an unknown error occurred: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
  }
}
