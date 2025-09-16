import { Container } from "inversify";

import { AuthController, FarmController, ProjectController, UserController } from "@/delivery/http/controller";
import { AppMiddleware, AuthMiddleware } from "@/delivery/http/middleware";
import { AuthRouter, FarmRouter, ProjectRouter, UserRouter } from "@/delivery/http/router";
import { FarmRepository, ProjectRepository, UserRepository } from "@/repository";
import { ConfigService } from "@/services/config";
import { ExpressService } from "@/services/express";
import { LoggingService } from "@/services/logger";
import type { IHTTPRouter } from "@/types/http";
import { HTTPRouterSym } from "@/types/symbols";
import { AuthUsecase, FarmUsecase, ProjectUsecase, UserUsecase } from "@/usecase";

import PrismaService from "./services/prisma";

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

  c.bind(AuthController).toSelf();
  c.bind(AuthUsecase).toSelf();

  c.bind(AppMiddleware).toSelf();
  c.bind(AuthMiddleware).toSelf();

  c.bind(ExpressService).toSelf();

  c.bind<IHTTPRouter>(HTTPRouterSym).to(UserRouter);
  c.bind<IHTTPRouter>(HTTPRouterSym).to(AuthRouter);
  c.bind<IHTTPRouter>(HTTPRouterSym).to(ProjectRouter);
  c.bind<IHTTPRouter>(HTTPRouterSym).to(FarmRouter);
}

function registerCoreServices(c: Container): void {
  c.bind(LoggingService).toSelf();
  c.bind(ConfigService).toSelf();
  c.bind(PrismaService).toSelf();
}

function bootstrap() {
  const container = new Container();
  registerCoreServices(container);
  registerAppServices(container);

  const log = container.get(LoggingService).withLabel("BOOTSTRAP");
  log.info("Starting application...");

  const app = container.get(ExpressService);
  log.info("Listening for incoming requests...");
  app.listen();
}

bootstrap();
