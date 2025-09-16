import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable, multiInject } from "inversify";
import type { Logger } from "winston";

import { AppMiddleware } from "@/delivery/http/middleware";
import type { IHTTPRouter } from "@/types/http";
import { HTTPRouterSym } from "@/types/symbols";
import { httpResponse } from "@/utils";

import { ConfigService } from "./config";
import { LoggingService } from "./logger";

@injectable("Singleton")
export class ExpressService {
  private _express = express();
  private _routerv1 = Router();
  private _logger: Logger;

  constructor(
    @inject(ConfigService) private readonly _config: ConfigService,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService,
    @multiInject(HTTPRouterSym) private readonly _httpRouters: IHTTPRouter[],
    @inject(AppMiddleware) private readonly _appMiddleware: AppMiddleware
  ) {
    this._logger = this._loggerInstance.withLabel("ExpressService");

    this._express.use(cookieParser());
    this._express.use(
      cors({
        origin: this._config.env.CORS_ORIGIN.split(",").map((o) => o.trim()),
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
      })
    );
    this._express.use(express.urlencoded({ extended: true }));
    this._express.use(express.json());

    this._express.use(this._appMiddleware.requestId, this._appMiddleware.httpLogger);

    // TODO: tampilkan halaman dokumentasi
    this._express.get("/", (_, res) => {
      httpResponse(res, StatusCodes.OK, { message: "Agroflow Backend API Service" });
    });

    this.registerRoutes();
    this._express.use("/v1", this._routerv1);

    this._express.use(this._appMiddleware.errorHandling);
  }

  private registerRoutes(): void {
    for (const r of this._httpRouters) {
      this._logger.info(`registering route ${r.path}`);
      this._routerv1.use(r.path, r.router);
    }
  }

  listen(): void {
    this._express.listen(this._config.env.APP_PORT, this._config.env.APP_HOST, () => {
      this._logger.info(`Express server started on http://${this._config.env.APP_HOST}:${this._config.env.APP_PORT}`);
    });
  }
}
