import { Container } from "inversify";

import { FarmRepository, ProjectRepository } from "@/repository";
import { ConfigService, LoggingService, PrismaService } from "@/services";
import { ConfigServiceSym, LoggingServiceSym, PrismaServiceSym } from "@/types";

import { McpService } from "./server";

async function main() {
  const c1 = new Container();

  c1.bind(ConfigServiceSym).to(ConfigService);
  c1.bind(LoggingServiceSym).to(LoggingService);
  c1.bind(PrismaServiceSym).to(PrismaService);

  c1.bind(ProjectRepository).toSelf();
  c1.bind(FarmRepository).toSelf();

  c1.bind(McpService).toSelf();

  const mcp = c1.get(McpService);
  await mcp.startStdio();
}

await main();
