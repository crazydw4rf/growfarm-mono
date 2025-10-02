import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable, multiInject } from "inversify";
import type { Logger } from "winston";

import { AppMiddleware } from "@/delivery/http/middleware";
import type { IHTTPRouter } from "@/types/http";
import { ConfigServiceSym, HTTPRouterSym, LoggingServiceSym } from "@/types/symbols";
import { httpResponse } from "@/utils";

import { type ConfigService } from "./config";
import { type LoggingService } from "./logger";

@injectable("Singleton")
export class ExpressService {
  private express = express();
  private routerv1 = Router();
  private logger: Logger;

  constructor(
    @inject(ConfigServiceSym) private readonly config: ConfigService,
    @inject(LoggingServiceSym) private readonly loggerInstance: LoggingService,
    @multiInject(HTTPRouterSym) private readonly httpRouters: IHTTPRouter[],
    @inject(AppMiddleware) private readonly appMiddleware: AppMiddleware,
  ) {
    this.logger = this.loggerInstance.withLabel("ExpressService");

    this.express.use(cookieParser());
    this.express.use(
      cors({
        origin: this.config
          .getEnv("CORS_ORIGIN")
          .split(",")
          .map((o) => o.trim()),
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
      }),
    );
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(express.json());

    this.express.use(this.appMiddleware.requestId, this.appMiddleware.httpLogger);

    // TODO: tampilkan halaman dokumentasi
    this.express.get("/", (_, res) => {
      httpResponse(res, StatusCodes.OK, { message: "GrowFarm Backend API Service" });
    });

    this.registerRoutes();
    this.express.use("/v1", this.routerv1);

    this.express.use(this.appMiddleware.errorHandling);
  }

  private registerRoutes(): void {
    for (const r of this.httpRouters) {
      this.logger.info(`registering route ${r.path}`);
      this.routerv1.use(r.path, r.router);
    }
  }

  listen(): void {
    const host = this.config.getEnv("APP_HOST");
    const port = this.config.getEnv("APP_PORT");

    this.express.listen(port, host, () => {
      this.logger.info(`Express server started on http://${host}:${port}`);
    });
  }
}
