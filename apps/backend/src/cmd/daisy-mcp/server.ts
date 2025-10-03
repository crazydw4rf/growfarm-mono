import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { inject, injectable } from "inversify";

import { type ConfigService, PrismaService } from "@/services";
import { ConfigServiceSym, PrismaServiceSym } from "@/types";

import Tools from "./tools";

// TODO: implementasi http server transport
@injectable("Singleton")
export class McpService extends McpServer {
  @inject(PrismaServiceSym) readonly prisma!: PrismaService;

  constructor(@inject(ConfigServiceSym) private readonly config: ConfigService) {
    super({
      name: config.getEnv("MCP_NAME"),
      version: config.getEnv("MCP_VERSION"),
    });

    this.registerAllTools();
  }

  registerAllTools(): void {
    for (const toolParams of Tools) {
      // @ts-expect-error: type error
      this.tool(toolParams.name, toolParams.description, toolParams.schema, toolParams.callback.bind(this));
    }
  }

  async startStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.connect(transport);
  }
}
