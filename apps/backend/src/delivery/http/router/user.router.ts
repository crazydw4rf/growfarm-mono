/* eslint-disable @typescript-eslint/unbound-method */
import express from "express";
import { inject, injectable } from "inversify";

import type { IHTTPRouter } from "@/types/http";

import { UserController } from "../controller";
import { AuthMiddleware } from "../middleware";

@injectable("Singleton")
export class UserRouter implements IHTTPRouter {
  readonly path = "/users";
  readonly router = express.Router();

  constructor(
    @inject(UserController) private readonly _userCtrl: UserController,
    @inject(AuthMiddleware) private readonly _authMw: AuthMiddleware,
  ) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post("/register", this._userCtrl.registerUser);
    this.router.get("/me", this._authMw.verifyJWT, this._userCtrl.me);
  }
}
