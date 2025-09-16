import { inject, injectable } from "inversify";
import jwt from "jsonwebtoken";
import type { Logger } from "winston";

import type { User, UserWithToken } from "@/entity";
import { type UserLoginDto } from "@/models";
import { type IUserRepository, UserRepository } from "@/repository";
import { ConfigService } from "@/services/config";
import { LoggingService } from "@/services/logger";
import { AppError, ErrorCause } from "@/types/errors";
import type { Result } from "@/types/helper";
import { Err, Ok } from "@/utils";

export interface IAuthUsecase {
  login(dto: UserLoginDto): Promise<Result<UserWithToken>>;
  refreshToken(id: string): Promise<Result<UserWithToken>>;
}

@injectable("Singleton")
export class AuthUsecase implements IAuthUsecase {
  private _logger: Logger;
  constructor(
    @inject(UserRepository) private readonly _userRepo: IUserRepository,
    @inject(ConfigService) private readonly _config: ConfigService,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService,
  ) {
    this._logger = this._loggerInstance.withLabel("AuthUsecase");
  }

  async login(dto: UserLoginDto): Promise<Result<UserWithToken>> {
    this._logger.debug("logging in user", { ...dto, password: undefined });

    const [user, err] = await this._userRepo.findByEmail(dto.email);
    if (err) {
      return Err(err);
    }

    const verifyPasswd = await Bun.password.verify(dto.password, user.password_hash);
    if (!verifyPasswd) {
      return Err(AppError.new("Invalid password", ErrorCause.CREDENTIALS_ERROR));
    }

    const [access_token, refresh_token] = this.generateToken(user);

    return Ok({ ...user, access_token, refresh_token });
  }

  async refreshToken(id: string): Promise<Result<UserWithToken>> {
    const [user, err] = await this._userRepo.get(id);
    if (err) {
      return Err(err);
    }

    const [access_token, refresh_token] = this.generateToken(user);

    return Ok({ ...user, access_token, refresh_token });
  }

  /** @returns A tuple containing the access token and refresh token [[accessToken, refreshToken]] */
  private generateToken(user: User): [string, string] {
    const accessToken = jwt.sign({ role: user.role }, this._config.env.JWT_ACCESS_SECRET, {
      algorithm: "HS256",
      expiresIn: "15m",
      subject: user.id,
    });
    const refreshToken = jwt.sign({}, this._config.env.JWT_REFRESH_SECRET, {
      algorithm: "HS256",
      expiresIn: "30d",
      subject: user.id,
    });

    return [accessToken, refreshToken];
  }
}
