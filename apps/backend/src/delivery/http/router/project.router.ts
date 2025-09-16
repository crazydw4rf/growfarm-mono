/* eslint-disable @typescript-eslint/unbound-method */
import express from "express";
import { inject, injectable } from "inversify";

import { ProjectController } from "@/delivery/http/controller";
import type { IHTTPRouter } from "@/types/http";

import { AuthMiddleware } from "../middleware";

@injectable("Singleton")
export class ProjectRouter implements IHTTPRouter {
  readonly path = "/projects";
  readonly router = express.Router();

  constructor(
    @inject(ProjectController) private readonly _projectCtrl: ProjectController,
    @inject(AuthMiddleware) private readonly _authMw: AuthMiddleware,
  ) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.use(this._authMw.verifyJWT);
    this.router.post("/", this._projectCtrl.createNewProject);
    this.router.get("/:projectId", this._projectCtrl.getProjectById);
    this.router.get("/", this._projectCtrl.getProjects);
    this.router.patch("/:projectId", this._projectCtrl.updateProject);
    this.router.delete("/:projectId", this._projectCtrl.deleteProject);
  }
}
