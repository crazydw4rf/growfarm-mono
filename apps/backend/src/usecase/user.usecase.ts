import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { User } from "@/entity";
import { type UserRegisterDto } from "@/models";
import { type IUserRepository, UserRepository } from "@/repository";
import { LoggingService } from "@/services/logger";
import type { Result } from "@/types/helper";
import { Err, Ok } from "@/utils";

export interface IUserUsecase {
  registerUser(dto: UserRegisterDto): Promise<Result<User>>;
  updateUser(): Promise<Result<unknown>>;
  deleteUser(): Promise<Result<unknown>>;
  getUserById(id: string): Promise<Result<User>>;
}

@injectable("Singleton")
export class UserUsecase implements IUserUsecase {
  private _logger: Logger;

  constructor(
    @inject(UserRepository) private readonly _userRepo: IUserRepository,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService,
  ) {
    this._logger = this._loggerInstance.withLabel("UserUsecase");
  }

  async registerUser(dto: UserRegisterDto): Promise<Result<User>> {
    this._logger.debug("registering user", { ...dto, password: null });

    const userPwd = await Bun.password.hash(dto.password);

    const userObject: Partial<User> = {
      email: dto.email,
      first_name: dto.first_name,
      last_name: dto.last_name,
      password_hash: userPwd,
    };

    const [user, err] = await this._userRepo.create(userObject);
    if (err) {
      return Err(err);
    }

    return Ok(user);
  }

  updateUser(): Promise<Result<unknown>> {
    throw new Error("Method not implemented.");
  }

  deleteUser(): Promise<Result<unknown>> {
    throw new Error("Method not implemented.");
  }

  async getUserById(id: string): Promise<Result<User>> {
    const [user, err] = await this._userRepo.get(id);
    if (err) {
      return Err(err);
    }

    return Ok(user);
  }
}
