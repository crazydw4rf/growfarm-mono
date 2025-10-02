/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFunction } from "express";
import { inject, injectable } from "inversify";

import { zChatRequest } from "@/models/chat.model";
import type { ExtendedRequest, ExtendedResponse } from "@/types";
import { ChatUsecase } from "@/usecase";
import { httpResponse, ValidatePayload } from "@/utils";

@injectable("Singleton")
export class ChatController {
  constructor(@inject(ChatUsecase) private readonly chatUsecase: ChatUsecase) {
    this.chatWithTools = this.chatWithTools.bind(this);
  }

  @ValidatePayload(zChatRequest)
  async chatWithTools(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    const [response, err] = await this.chatUsecase.chatWithTools(req.body);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, 200, response);
  }
}
