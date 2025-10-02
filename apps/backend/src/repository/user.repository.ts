// I hate typescript
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { User } from "@/entity";
import { Prisma } from "@/generated/prisma/client";
import type { LoggingService, PrismaService } from "@/services";
import type { BaseRepositoryInterface, Result } from "@/types";
import { AppError, ErrorCause, LoggingServiceSym, PrismaServiceSym } from "@/types";
import { Err, Ok } from "@/utils";

export interface IUserRepository extends BaseRepositoryInterface<User> {
  findByEmail(email: string): Promise<Result<User>>;
  findMany(offset: number, limit: number): Promise<Result<User[]>>;
}

@injectable("Singleton")
export class UserRepository implements IUserRepository {
  private logger: Logger;

  constructor(
    @inject(PrismaServiceSym) private readonly prisma: PrismaService,
    @inject(LoggingServiceSym) private readonly loggerInstance: LoggingService,
  ) {
    this.logger = this.loggerInstance.withLabel("UserRepository");
  }

  async create(data: User): Promise<Result<User>> {
    try {
      const createdUser = await this.prisma.user.create({ data: { ...data } });
      this.logger.debug("new user created", { ...data, password_hash: undefined });

      return Ok(createdUser);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async get(id: string): Promise<Result<User>> {
    try {
      const user = await this.prisma.user.findFirst({ where: { id } });
      if (!user) {
        return Err(AppError.new("user not found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(user);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async findByEmail(email: string): Promise<Result<User>> {
    try {
      const user = await this.prisma.user.findFirst({ where: { email } });
      if (!user) {
        return Err(AppError.new("user not found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(user);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async findMany(offset: number, limit: number): Promise<Result<User[]>> {
    try {
      const users = await this.prisma.user.findMany({
        skip: offset,
        take: limit,
        orderBy: { created_at: "desc" },
      });

      if (users.length <= 0) {
        return Err(AppError.new("no users found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(users);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async update(id: string, data: User): Promise<Result<User>> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { ...data },
      });
      return Ok(user);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async delete(id: string): Promise<Result<boolean>> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return Ok(true);
    } catch (e) {
      return this.handleError(e);
    }
  }

  private handleError(e: any): Result<any> {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return Err(AppError.new("email already exists", ErrorCause.DUPLICATE_ENTRY));
      } else if (e.code === "P2025") {
        return Err(AppError.new("user not found", ErrorCause.ENTRY_NOT_FOUND));
      }
      return Err(AppError.new(e.message, ErrorCause.DATABASE_ERROR));
    }
    return Err(AppError.new("an unknown error occurred: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
  }
}
