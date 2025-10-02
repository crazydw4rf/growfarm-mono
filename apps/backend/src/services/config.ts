import dot from "dotenv";
import { injectable } from "inversify";
import zod, { type infer as Infer } from "zod";

const zEnvConfig = zod.object({
  APP_HOST: zod.string().default("localhost"),
  APP_PORT: zod.coerce.number().default(3000),
  APP_ENV: zod.enum(["development", "production", "test"]).default("development"),
  DOMAIN_NAME: zod.hostname().default("localhost"),
  DATABASE_URL: zod.url({ protocol: /postgres.*/ }),
  JWT_ACCESS_SECRET: zod.string(),
  JWT_REFRESH_SECRET: zod.string(),
  CORS_ORIGIN: zod.string().default("*"),
  MCP_NAME: zod.string(),
  MCP_VERSION: zod.string(),
  MCP_COMMAND: zod
    .string()
    .transform((v) => v.split(" "))
    .default(["bun", "run", "daisy.js"]), // example: bun run daisy.js
  GEMINI_API_KEY: zod.string(),
});

export type EnvConfig = Infer<typeof zEnvConfig>;

@injectable("Singleton")
export class ConfigService {
  private envConfig: EnvConfig;

  constructor() {
    dot.config({ debug: false, quiet: true });
    this.envConfig = zEnvConfig.parse(process.env);
  }

  getEnv<P extends keyof EnvConfig>(key: P): EnvConfig[P] {
    return this.envConfig[key];
  }
}
