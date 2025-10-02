/* eslint-disable @typescript-eslint/unbound-method */
import { Router } from "express";
import { inject, injectable } from "inversify";

import type { IHTTPRouter } from "@/types";

import { ChatController } from "../controller";
import { AuthMiddleware } from "../middleware";

@injectable("Singleton")
export class ChatRouter implements IHTTPRouter {
  path = "/chat";
  router = Router();

  constructor(
    @inject(ChatController) private readonly chatController: ChatController,
    @inject(AuthMiddleware) private readonly authMiddleware: AuthMiddleware,
  ) {
    this.router.use(this.authMiddleware.verifyJWT);
    this.router.post("/", this.chatController.chatWithTools);
  }
}
