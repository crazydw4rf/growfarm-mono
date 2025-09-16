import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { Farm } from "@/entity";
import { type FarmCreateDto, type FarmUpdateDto } from "@/models";
import { FarmRepository, type IFarmRepository } from "@/repository";
import { LoggingService } from "@/services/logger";
import type { Result } from "@/types/helper";
import { Err, Ok } from "@/utils";

export interface IFarmUsecase {
  newFarm(dto: FarmCreateDto): Promise<Result<Farm>>;
  updateFarm(id: string, dto: FarmUpdateDto): Promise<Result<Farm>>;
  deleteFarm(id: string): Promise<Result<boolean>>;
  getFarmById(id: string): Promise<Result<Farm>>;
  getFarmsByProject(projectId: string, page: { skip?: number; take?: number }): Promise<Result<Farm[]>>;
  getFarmByProjectAndId(projectId: string, farmId: string): Promise<Result<Farm>>;
}

@injectable("Singleton")
export class FarmUsecase implements IFarmUsecase {
  private _logger: Logger;

  constructor(
    @inject(FarmRepository) private readonly _farmRepo: IFarmRepository,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService
  ) {
    this._logger = this._loggerInstance.withLabel("FarmUsecase");
  }

  async newFarm(dto: FarmCreateDto): Promise<Result<Farm>> {
    this._logger.debug("creating new farm", dto);

    const [farm, err] = await this._farmRepo.create(dto);
    if (err) {
      return Err(err);
    }

    return Ok(farm);
  }

  async updateFarm(id: string, dto: FarmUpdateDto): Promise<Result<Farm>> {
    this._logger.debug("updating farm", { id, dto });

    const [farm, err] = await this._farmRepo.update(id, dto);
    if (err) {
      return Err(err);
    }

    return Ok(farm);
  }

  async getFarmById(id: string): Promise<Result<Farm>> {
    const [farm, err] = await this._farmRepo.get(id);
    if (err) {
      return Err(err);
    }

    return Ok(farm);
  }

  async getFarmByProjectAndId(projectId: string, farmId: string): Promise<Result<Farm>> {
    const [farm, err] = await this._farmRepo.findByProjectAndId(projectId, farmId);
    if (err) {
      return Err(err);
    }

    return Ok(farm);
  }

  async getFarmsByProject(projectId: string, page: { skip?: number; take?: number }): Promise<Result<Farm[]>> {
    const [farms, err] = await this._farmRepo.findManyByProject(projectId, page);
    if (err) {
      return Err(err);
    }

    return Ok(farms);
  }

  async deleteFarm(id: string): Promise<Result<boolean>> {
    const [ok, err] = await this._farmRepo.delete(id);
    if (!ok || err) {
      return Err(err);
    }

    return Ok(true);
  }
}
