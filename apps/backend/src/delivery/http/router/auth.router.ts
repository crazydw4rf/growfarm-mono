/* eslint-disable @typescript-eslint/unbound-method */
import { Router } from "express";
import { inject, injectable } from "inversify";

import type { IHTTPRouter } from "@/types/http";

import { AuthController } from "../controller";
import { AuthMiddleware } from "../middleware";

@injectable("Singleton")
export class AuthRouter implements IHTTPRouter {
  readonly path = "/auth";
  readonly router = Router();

  constructor(
    @inject(AuthMiddleware) private readonly _authMw: AuthMiddleware,
    @inject(AuthController) private readonly _authController: AuthController,
  ) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post("/login", this._authController.loginUser);
    this.router.post("/logout", this._authController.logoutUser);
    this.router.post("/refresh", this._authMw.verifyRefreshJWT, this._authController.refreshToken);
  }
}
