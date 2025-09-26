import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import { LoggingService } from "@/services/logger";
import { httpError } from "@/utils/http";
import Merror from "@/utils/merror";

@injectable("Singleton")
export class AppMiddleware {
  private logger: Logger;

  constructor(@inject(LoggingService) private readonly loggerInstance: LoggingService) {
    this.logger = this.loggerInstance.withLabel("AppMiddleware");
  }

  public httpLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    const { method, path } = req;
    const reqId = res.get("X-Request-Id");

    res.on("finish", () => {
      this.logger.debug(`${method} ${path} ${res.statusCode} - ${Date.now() - start}ms`, {
        requestId: reqId,
      });
    });

    next();
  };

  public requestId = (req: Request, res: Response, next: NextFunction): void => {
    const reqId = req.get("X-Request-Id");
    if (!reqId) {
      res.set({ "X-Request-Id": Bun.randomUUIDv7() });
    }

    next();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public errorHandling = (err: Error | Merror, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof Merror) {
      this.logger.error("an error occurred while processing the request", err.root);
      httpError(res, err);
      return;
    }

    this.logger.error("unknown error occurred", { message: err.message, cause: err.cause });

    httpError(res, Merror.new(err));
  };
}
