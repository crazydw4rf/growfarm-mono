/* eslint-disable @typescript-eslint/unbound-method */
import express from "express";
import { inject, injectable } from "inversify";

import { ProjectController, ReportController } from "@/delivery/http/controller";
import type { IHTTPRouter } from "@/types/http";

import { AuthMiddleware } from "../middleware";

@injectable("Singleton")
export class ProjectRouter implements IHTTPRouter {
  readonly path = "/projects";
  readonly router = express.Router();

  constructor(
    @inject(ProjectController) private readonly projectCtrl: ProjectController,
    @inject(ReportController) private readonly reportCtrl: ReportController,
    @inject(AuthMiddleware) private readonly authMw: AuthMiddleware
  ) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.use(this.authMw.verifyJWT);
    this.router.post("/", this.projectCtrl.createNewProject);
    this.router.get("/:projectId", this.projectCtrl.getProjectById);
    this.router.get("/", this.projectCtrl.getProjects);
    this.router.patch("/:projectId", this.projectCtrl.updateProject);
    this.router.delete("/:projectId", this.projectCtrl.deleteProject);

    this.router.get("/:projectId/report", this.reportCtrl.genProjectReportOne);
    this.router.post("/:projectId/report", this.reportCtrl.genProjectReportByDate);
  }
}
