import dotenv from "dotenv";
import { injectable } from "inversify";
import zod from "zod/v4";

const zEnvConfig = zod.object({
  APP_HOST: zod.string().default("localhost"),
  APP_PORT: zod.coerce.number().default(3000),
  APP_ENV: zod.enum(["development", "production", "test"]).default("development"),
  DOMAIN_NAME: zod.hostname().default("localhost"),
  DATABASE_URL: zod.url({ protocol: /postgres.*/ }),
  JWT_ACCESS_SECRET: zod.string(),
  JWT_REFRESH_SECRET: zod.string(),
  CORS_ORIGIN: zod.string().default("*"),
  REDIS_HOST: zod.string().default("localhost"),
  REDIS_PORT: zod.coerce.number().default(6379),
});

type EnvConfig = zod.infer<typeof zEnvConfig>;

@injectable("Singleton")
export class ConfigService {
  public env!: EnvConfig;

  constructor() {
    this.loadEnv();
    this.parseEnv();
  }

  protected loadEnv(): void {
    dotenv.config({ quiet: true });
  }

  protected parseEnv(): void {
    const config = zEnvConfig.safeParse(process.env);
    if (!config.success) {
      throw new Error("Failed to parse environment variables: " + config.error.message);
    }

    this.env = config.data;
  }
}
