import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { Farm } from "@/entity";
import { Prisma } from "@/generated/prisma/client";
import { LoggingService } from "@/services/logger";
import PrismaService from "@/services/prisma";
import { AppError, ErrorCause } from "@/types/errors";
import type { BaseRepositoryInterface, Result } from "@/types/helper";
import { Err, Ok } from "@/utils";

export interface IFarmRepository extends BaseRepositoryInterface<Farm> {
  findManyByProject(projectId: string, page: { skip?: number; take?: number }): Promise<Result<Farm[]>>;
  findByProjectAndId(projectId: string, farmId: string): Promise<Result<Farm>>;
}

@injectable("Singleton")
export class FarmRepository implements IFarmRepository {
  private _logger: Logger;

  constructor(
    @inject(PrismaService) private readonly _prisma: PrismaService,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService
  ) {
    this._logger = this._loggerInstance.withLabel("FarmRepository");
  }

  async create(data: Farm): Promise<Result<Farm>> {
    try {
      const farm = await this._prisma.farm.create({
        data: { ...data },
        include: { project: true },
      });
      this._logger.debug("new farm created", { ...data });

      return Ok(farm);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async get(id: string): Promise<Result<Farm>> {
    try {
      const farm = await this._prisma.farm.findFirst({
        where: { id },
        include: { project: true },
      });
      if (!farm) {
        return Err(AppError.new("farm not found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(farm);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async findByProjectAndId(projectId: string, farmId: string): Promise<Result<Farm>> {
    try {
      const farm = await this._prisma.farm.findFirst({
        where: {
          id: farmId,
          project_id: projectId,
        },
        include: { project: true },
      });
      if (!farm) {
        return Err(AppError.new("farm not found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(farm);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async findManyByProject(projectId: string, page: { skip: number; take: number }): Promise<Result<Farm[]>> {
    try {
      const farms = await this._prisma.farm.findMany({
        where: { project_id: projectId },
        ...page,
        orderBy: { created_at: "desc" },
        include: { project: true },
      });

      return Ok(farms);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async update(id: string, data: Farm): Promise<Result<Farm>> {
    try {
      const farm = await this._prisma.farm.update({
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
      await this._prisma.farm.delete({ where: { id } });
      return Ok(true);
    } catch (e) {
      return this.handleError(e);
    }
  }

  private handleError(e: any): Result<any> {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return Err(AppError.new("farm already exists", ErrorCause.DUPLICATE_ENTRY));
      } else if (e.code === "P2025") {
        return Err(AppError.new("farm not found", ErrorCause.ENTRY_NOT_FOUND));
      } else if (e.code === "P2003") {
        return Err(AppError.new("project not found", ErrorCause.ENTRY_NOT_FOUND));
      }
      return Err(AppError.new(e.message, ErrorCause.DATABASE_ERROR));
    }
    return Err(AppError.new("an unknown error occurred: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
  }
}
