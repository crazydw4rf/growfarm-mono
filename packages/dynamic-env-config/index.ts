import dot from "dotenv";
import { z } from "zod/v4";

export class DynamicEnvConfig<T extends z.ZodObject> {
  private config: z.TypeOf<T>;

  constructor(schema: T) {
    this.loadEnv();
    this.config = this.parseConfig(schema);
  }

  get<P extends keyof z.TypeOf<T>>(key: P): z.TypeOf<T>[P] {
    return this.config[key];
  }

  private loadEnv() {
    dot.config({ debug: false, quiet: true });
  }

  private parseConfig(schema: T) {
    return schema.parse(process.env);
  }
}

export default DynamicEnvConfig;
