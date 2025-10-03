import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { Activity, Farm } from "@/entity";
import { Prisma } from "@/generated/prisma/client";
import type { LoggingService, PrismaService } from "@/services";
import { type BaseRepositoryInterface, ErrorCause, LoggingServiceSym, type PaginatedObject, PrismaServiceSym, type Result } from "@/types";
import { Err, Ok } from "@/utils";

export interface IFarmRepository extends BaseRepositoryInterface<Farm> {
  findManyByProject(projectId: string, page: { skip?: number; take?: number }): Promise<Result<PaginatedObject<Farm[]>>>;
  findByProjectAndId(projectId: string, farmId: string): Promise<Result<Farm>>;
  createActivity(farmId: string, data: any): Promise<Result<Activity>>;
  updateActivity(activityId: string, data: any): Promise<Result<Activity>>;
  deleteActivity(activityId: string): Promise<Result<Activity>>;
  findActivities(farmId: string, page: { skip?: number; take?: number }): Promise<Result<PaginatedObject<Activity[]>>>;
}

@injectable("Singleton")
export class FarmRepository implements IFarmRepository {
  private logger: Logger;

  constructor(
    @inject(PrismaServiceSym) private readonly prisma: PrismaService,
    @inject(LoggingServiceSym) private readonly loggerInstance: LoggingService,
  ) {
    this.logger = this.loggerInstance.withLabel("FarmRepository");
  }

  async create(data: Farm, projectId: string): Promise<Result<Farm>> {
    try {
      const farm = await this.prisma.farm.create({
        data: { ...data, project_id: projectId },
        include: { project: true },
      });
      this.logger.debug("new farm created", { ...data });

      return Ok(farm);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async get(id: string): Promise<Result<Farm>> {
    try {
      const farm = await this.prisma.farm.findFirst({
        where: { id },
        include: { project: true },
      });
      if (!farm) {
        return Err("farm not found", ErrorCause.ENTRY_NOT_FOUND);
      }

      return Ok(farm);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async findByProjectAndId(projectId: string, farmId: string): Promise<Result<Farm>> {
    try {
      const farm = await this.prisma.farm.findFirst({
        where: {
          id: farmId,
          project_id: projectId,
        },
        include: { project: true },
      });
      if (!farm) {
        return Err("farm not found", ErrorCause.ENTRY_NOT_FOUND);
      }

      return Ok(farm);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async findManyByProject(projectId: string, page: { skip: number; take: number }): Promise<Result<PaginatedObject<Farm[]>>> {
    try {
      const [farms, count] = await this.prisma.$transaction([
        this.prisma.farm.findMany({
          where: { project_id: projectId },
          ...page,
          orderBy: { created_at: "desc" },
          include: { project: true },
        }),
        this.prisma.farm.count({ where: { project_id: projectId } }),
      ]);

      return Ok({ data: farms, count, ...page });
    } catch (e) {
      return this.handleError(e);
    }
  }

  async update(id: string, data: Farm): Promise<Result<Farm>> {
    try {
      const farm = await this.prisma.farm.update({
        where: { id },
        data: { ...data },
        include: { project: true },
      });
      return Ok(farm);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async delete(id: string): Promise<Result<boolean>> {
    try {
      await this.prisma.farm.delete({ where: { id } });
      return Ok(true);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async createActivity(farmId: string, data: Activity): Promise<Result<Activity>> {
    try {
      const activity = await this.prisma.activity.create({
        data: { ...data, farm_id: farmId },
      });

      return Ok(activity);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async updateActivity(activityId: string, data: Activity): Promise<Result<Activity>> {
    try {
      const activity = await this.prisma.activity.update({
        where: { id: activityId },
        data: { ...data },
      });

      return Ok(activity);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async deleteActivity(activityId: string): Promise<Result<Activity>> {
    try {
      const activity = await this.prisma.activity.delete({
        where: { id: activityId },
      });

      return Ok(activity);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async findActivities(farmId: string, page: { skip?: number; take?: number }): Promise<Result<PaginatedObject<Activity[]>>> {
    try {
      const skip = page.skip ?? 0;
      const take = page.take ?? 10;

      const [activities, count] = await this.prisma.$transaction([
        this.prisma.activity.findMany({
          where: { farm_id: farmId },
          skip,
          take,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.activity.count({ where: { farm_id: farmId } }),
      ]);

      return Ok({ data: activities, count, skip, take });
    } catch (e) {
      return this.handleError(e);
    }
  }

  private handleError(e: any): Result<any> {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return Err("farm already exists", ErrorCause.DUPLICATE_ENTRY);
      } else if (e.code === "P2025") {
        return Err("farm not found", ErrorCause.ENTRY_NOT_FOUND);
      } else if (e.code === "P2003") {
        return Err("project not found", ErrorCause.ENTRY_NOT_FOUND);
      }
      return Err(e.message, ErrorCause.DATABASE_ERROR);
    }
    return Err("an unknown error occurred: ".concat(e as string), ErrorCause.UNKNOWN_ERROR);
  }
}
