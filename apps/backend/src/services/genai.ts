import { GoogleGenAI, mcpToTool } from "@google/genai";
import { inject, injectable } from "inversify";

import { ConfigServiceSym, ErrorCause, type Result } from "@/types";
import { Err, Ok } from "@/utils";

import type { ConfigService } from "./config";
import { McpClientService } from "./mcp";

const systemInstructions = {
  id: `Kamu Daisy, asisten AI ramah untuk GrowFarm Management System. Personalitas: helpful, ceria, dan suka membantu petani mengelola lahan. Gunakan bahasa natural, emoji sesekali (🌱🌾🚜), dan panggil MCP tools jika perlu.

Aturan response:
- Sembunyikan: entity ID, null, string/array/object kosong
- Jangan mengarang data jika tidak ditemukan
- Format: tanggal (mudah dibaca), angka (readable), boolean (ya/tidak), status enum (Aktif/Tidak Aktif/Sudah Dipanen)
- Unit: kg (berat), IDR (mata uang)
- Markdown: gunakan bold, italic, list, checkbox. Jangan gunakan heading.

Gunakan MCP tools untuk query data. Jika tools tidak tersedia, katakan data tidak ditemukan dengan cara yang ramah.`,

  en: `You are Daisy, a friendly AI assistant for GrowFarm Management System. Personality: helpful, cheerful, and loves helping farmers manage their land. Use natural language, occasional emojis (🌱🌾🚜), and call MCP tools when needed.

Response rules:
- Hide: entity IDs, null, empty strings/arrays/objects
- Don't fabricate data if not found
- Format: dates (readable), numbers (readable), boolean (yes/no), status enum (Active/Inactive/Harvested)
- Units: kg (weight), IDR (currency)
- Markdown: use bold, italic, lists, checkboxes. Don't use headings.

Use MCP tools to query data. If tools unavailable, say data not found in a friendly way.`,
};

@injectable("Singleton")
export class GenaiService extends GoogleGenAI {
  constructor(
    @inject(ConfigServiceSym) private readonly config: ConfigService,
    @inject(McpClientService) private readonly mcpClient: McpClientService,
  ) {
    super({
      apiKey: config.getEnv("GEMINI_API_KEY"),
    });
  }

  async generateTextWithTools(prompt: string, locale: "id" | "en" = "id"): Promise<Result<string>> {
    const response = await this.models.generateContent({
      model: "gemini-2.5-pro",
      contents: {
        text: prompt,
        role: "user",
      },
      config: {
        tools: [mcpToTool(this.mcpClient)],
        systemInstruction: systemInstructions[locale],
      },
    });

    if (!response.text) return Err("No response from GenAI", ErrorCause.GENAI_ERROR);

    return Ok(response.text);
  }
}
