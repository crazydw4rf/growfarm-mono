import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { ChatRequestDto, ChatResponse } from "@/models/chat.model";
import type { LoggingService } from "@/services";
import { GenaiService } from "@/services/genai";
import { LoggingServiceSym, type Result } from "@/types";
import { Err, Ok } from "@/utils";

export interface IChatUsecase {
  chatWithTools(dto: ChatRequestDto): Promise<Result<ChatResponse>>;
  // chatWithInfo(dto: ChatRequestDto): Promise<Result<ChatResponse>>;
}

@injectable("Singleton")
export class ChatUsecase implements IChatUsecase {
  private logger: Logger;

  constructor(
    @inject(LoggingServiceSym) private readonly loggerInstance: LoggingService,
    @inject(GenaiService) private readonly genai: GenaiService,
  ) {
    this.logger = this.loggerInstance.withLabel("ChatUsecase");
  }

  async chatWithTools(dto: ChatRequestDto): Promise<Result<ChatResponse>> {
    const [response, err] = await this.genai.generateTextWithTools(dto.prompt, dto.locale);
    if (err) {
      this.logger.error("Error generating text with GenAI", { err });
      return Err(err);
    }

    return Ok({ response });
  }

  /* async chatWithInfo(dto: ChatRequestDto): Promise<Result<ChatResponse>> {
    throw new Error("Method not implemented.");
  } */
}
