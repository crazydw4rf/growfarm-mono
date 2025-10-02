import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import { type ConfigService, type LoggingService } from "@/services";
import { ConfigServiceSym, LoggingServiceSym } from "@/types";

@injectable("Singleton")
export class McpClientService extends Client {
  private transport_: StdioClientTransport;
  private logger: Logger;

  constructor(
    @inject(LoggingServiceSym) private readonly loggerInstance: LoggingService,
    @inject(ConfigServiceSym) private readonly config: ConfigService,
  ) {
    super({
      name: config.getEnv("MCP_NAME"),
      version: config.getEnv("MCP_VERSION"),
    });

    this.logger = this.loggerInstance.withLabel("McpClientService");

    this.transport_ = new StdioClientTransport({
      command: this.config.getEnv("MCP_COMMAND")[0]!,
      args: this.config.getEnv("MCP_COMMAND").slice(1),
    });

    this.startStdio();
  }

  startStdio(): void {
    this.logger.info("Starting MCP client with stdio transport");
    this.connect(this.transport_).catch((err) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.logger.error("Error connecting to MCP server", { err });
    });
  }
}
