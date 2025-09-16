/* eslint-disable @typescript-eslint/unbound-method */
import express from "express";
import { inject, injectable } from "inversify";

import { FarmController } from "@/delivery/http/controller";
import type { IHTTPRouter } from "@/types/http";

import { AuthMiddleware } from "../middleware";

@injectable("Singleton")
export class FarmRouter implements IHTTPRouter {
  readonly path = "/projects/:projectId/farms";
  readonly router = express.Router({ mergeParams: true });

  constructor(
    @inject(FarmController) private readonly _farmCtrl: FarmController,
    @inject(AuthMiddleware) private readonly _authMw: AuthMiddleware,
  ) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.use(this._authMw.verifyJWT);
    this.router.post("/", this._farmCtrl.createNewFarm);
    this.router.get("/:farmId", this._farmCtrl.getFarmByProjectAndId);
    this.router.get("/", this._farmCtrl.getFarmsByProject);
    this.router.patch("/:farmId", this._farmCtrl.updateFarm);
    this.router.delete("/:farmId", this._farmCtrl.deleteFarm);
  }
}
