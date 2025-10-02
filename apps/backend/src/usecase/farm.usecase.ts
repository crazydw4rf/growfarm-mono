import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { Farm } from "@/entity";
import { type FarmCreateDto, type FarmUpdateDto } from "@/models";
import { FarmRepository, type IFarmRepository } from "@/repository";
import { type LoggingService } from "@/services/logger";
import { LoggingServiceSym } from "@/types";
import type { PaginatedObject, Result } from "@/types/helper";
import { Err, Ok } from "@/utils";

export interface IFarmUsecase {
  newFarm(projectId: string, dto: FarmCreateDto): Promise<Result<Farm>>;
  updateFarm(id: string, dto: FarmUpdateDto): Promise<Result<Farm>>;
  deleteFarm(id: string): Promise<Result<boolean>>;
  getFarmById(id: string): Promise<Result<Farm>>;
  getFarmsByProject(projectId: string, page: { skip?: number; take?: number }): Promise<Result<PaginatedObject<Farm[]>>>;
  getFarmByProjectAndId(projectId: string, farmId: string): Promise<Result<Farm>>;
}

@injectable("Singleton")
export class FarmUsecase implements IFarmUsecase {
  private logger: Logger;

  constructor(
    @inject(FarmRepository) private readonly farmRepo: IFarmRepository,
    @inject(LoggingServiceSym) private readonly loggerInstance: LoggingService,
  ) {
    this.logger = this.loggerInstance.withLabel("FarmUsecase");
  }

  async newFarm(projectId: string, dto: FarmCreateDto): Promise<Result<Farm>> {
    this.logger.debug("creating new farm", dto);

    const [farm, err] = await this.farmRepo.create(dto, projectId);
    if (err) {
      return Err(err);
    }

    return Ok(farm);
  }

  async updateFarm(id: string, dto: FarmUpdateDto): Promise<Result<Farm>> {
    this.logger.debug("updating farm", { id, dto });

    const [farm, err] = await this.farmRepo.update(id, dto);
    if (err) {
      return Err(err);
    }

    return Ok(farm);
  }

  async getFarmById(id: string): Promise<Result<Farm>> {
    const [farm, err] = await this.farmRepo.get(id);
    if (err) {
      return Err(err);
    }

    return Ok(farm);
  }

  async getFarmByProjectAndId(projectId: string, farmId: string): Promise<Result<Farm>> {
    const [farm, err] = await this.farmRepo.findByProjectAndId(projectId, farmId);
    if (err) {
      return Err(err);
    }

    return Ok(farm);
  }

  async getFarmsByProject(projectId: string, page: { skip?: number; take?: number }): Promise<Result<PaginatedObject<Farm[]>>> {
    const [farms, err] = await this.farmRepo.findManyByProject(projectId, page);
    if (err) {
      return Err(err);
    }

    return Ok(farms);
  }

  async deleteFarm(id: string): Promise<Result<boolean>> {
    const [ok, err] = await this.farmRepo.delete(id);
    if (!ok || err) {
      return Err(err);
    }

    return Ok(true);
  }
}
