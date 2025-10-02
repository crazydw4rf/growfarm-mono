import { PrismaPg } from "@prisma/adapter-pg";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";
import { ConfigServiceSym, LoggingServiceSym } from "@/types";

import { type ConfigService } from "./config";
import { type LoggingService } from "./logger";

@injectable("Singleton")
export class PrismaService extends PrismaClient {
  private logger: Logger;

  constructor(
    @inject(LoggingServiceSym) private readonly loggerInstance: LoggingService,
    @inject(ConfigServiceSym) private readonly config: ConfigService,
  ) {
    const adapter = new PrismaPg({ connectionString: config.getEnv("DATABASE_URL") });
    super({ adapter });

    this.logger = this.loggerInstance.withLabel("PrismaService");

    this.tryConnect();
  }

  tryConnect(): void {
    this.logger.info("attempting to connect to the database...");

    this.$queryRaw`SELECT 1`.catch((e) => {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.error("failed to connect to the database. Please check your database connection settings.", {
          message: e.message,
        });
        process.exit(1);
      }

      this.logger.error("an unexpected error occurred while connecting to the database.", e as object);
      process.exit(1);
    });

    this.logger.info("successfully connected to the database.");
  }
}
