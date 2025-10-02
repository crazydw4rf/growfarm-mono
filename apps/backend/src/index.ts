import { Container } from "inversify";

import {
  AuthController,
  ChatController,
  FarmController,
  ProjectController,
  ReportController,
  UserController,
} from "@/delivery/http/controller";
import { AppMiddleware, AuthMiddleware } from "@/delivery/http/middleware";
import { AuthRouter, ChatRouter, FarmRouter, ProjectRouter, UserRouter } from "@/delivery/http/router";
import { FarmRepository, ProjectRepository, UserRepository } from "@/repository";
import { ConfigService, LoggingService, PrismaService } from "@/services";
import { ExpressService } from "@/services/express";
import { ConfigServiceSym, ExpressServiceSym, HTTPRouterSym, type IHTTPRouter, LoggingServiceSym, PrismaServiceSym } from "@/types";
import { AuthUsecase, ChatUsecase, FarmUsecase, ProjectUsecase, UserUsecase } from "@/usecase";

import { GenaiService } from "./services/genai";
import { McpClientService } from "./services/mcp";

function registerAppServices(c: Container): void {
  c.bind(UserRepository).toSelf();
  c.bind(UserUsecase).toSelf();
  c.bind(UserController).toSelf();

  c.bind(ProjectRepository).toSelf();
  c.bind(ProjectUsecase).toSelf();
  c.bind(ProjectController).toSelf();

  c.bind(FarmRepository).toSelf();
  c.bind(FarmUsecase).toSelf();
  c.bind(FarmController).toSelf();

  c.bind(ReportController).toSelf();

  c.bind(ChatUsecase).toSelf();
  c.bind(ChatController).toSelf();

  c.bind(AuthController).toSelf();
  c.bind(AuthUsecase).toSelf();

  c.bind(AppMiddleware).toSelf();
  c.bind(AuthMiddleware).toSelf();

  c.bind(McpClientService).toSelf();
  c.bind(GenaiService).toSelf();

  c.bind(ExpressServiceSym).to(ExpressService);

  c.bind<IHTTPRouter>(HTTPRouterSym).to(UserRouter);
  c.bind<IHTTPRouter>(HTTPRouterSym).to(AuthRouter);
  c.bind<IHTTPRouter>(HTTPRouterSym).to(ProjectRouter);
  c.bind<IHTTPRouter>(HTTPRouterSym).to(FarmRouter);
  c.bind<IHTTPRouter>(HTTPRouterSym).to(ChatRouter);
}

function registerCoreServices(c: Container): void {
  c.bind(LoggingServiceSym).to(LoggingService);
  c.bind(ConfigServiceSym).to(ConfigService);
  c.bind(PrismaServiceSym).to(PrismaService);
}

function bootstrap() {
  const container = new Container();
  registerCoreServices(container);
  registerAppServices(container);

  const log = container.get<LoggingService>(LoggingServiceSym).withLabel("BOOTSTRAP");
  log.info("Starting application...");

  const app = container.get<ExpressService>(ExpressServiceSym);
  log.info("Listening for incoming requests...");
  app.listen();
}

bootstrap();
