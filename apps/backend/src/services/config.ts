import { DynamicEnvConfig } from "dynamic-env-config";
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
});

@injectable("Singleton")
export class ConfigService extends DynamicEnvConfig<typeof zEnvConfig> {
  constructor() {
    super(zEnvConfig);
  }
}
