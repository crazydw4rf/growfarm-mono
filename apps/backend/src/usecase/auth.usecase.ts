import { inject, injectable } from "inversify";
import jwt from "jsonwebtoken";
import type { Logger } from "winston";

import type { User, UserWithToken } from "@/entity";
import { type UserLoginDto } from "@/models";
import { type IUserRepository, UserRepository } from "@/repository";
import type { ConfigService, LoggingService } from "@/services";
import { ConfigServiceSym, LoggingServiceSym } from "@/types";
import { AppError, ErrorCause } from "@/types/errors";
import type { Result } from "@/types/helper";
import { Err, Ok } from "@/utils";

export interface IAuthUsecase {
  login(dto: UserLoginDto): Promise<Result<UserWithToken>>;
  refreshToken(id: string): Promise<Result<UserWithToken>>;
}

@injectable("Singleton")
export class AuthUsecase implements IAuthUsecase {
  private logger: Logger;
  constructor(
    @inject(UserRepository) private readonly userRepo: IUserRepository,
    @inject(ConfigServiceSym) private readonly config: ConfigService,
    @inject(LoggingServiceSym) private readonly loggerInstance: LoggingService,
  ) {
    this.logger = this.loggerInstance.withLabel("AuthUsecase");
  }

  async login(dto: UserLoginDto): Promise<Result<UserWithToken>> {
    this.logger.debug("logging in user", { ...dto, password: undefined });

    const [user, err] = await this.userRepo.findByEmail(dto.email);
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
    const [user, err] = await this.userRepo.get(id);
    if (err) {
      return Err(err);
    }

    const [access_token, refresh_token] = this.generateToken(user);

    return Ok({ ...user, access_token, refresh_token });
  }

  /** @returns A tuple containing the access token and refresh token [[accessToken, refreshToken]] */
  private generateToken(user: User): [string, string] {
    const accessToken = jwt.sign({}, this.config.getEnv("JWT_ACCESS_SECRET"), {
      algorithm: "HS256",
      expiresIn: "15m",
      subject: user.id,
    });
    const refreshToken = jwt.sign({}, this.config.getEnv("JWT_REFRESH_SECRET"), {
      algorithm: "HS256",
      expiresIn: "30d",
      subject: user.id,
    });

    return [accessToken, refreshToken];
  }
}
