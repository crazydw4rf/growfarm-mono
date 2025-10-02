import { GoogleGenAI, mcpToTool } from "@google/genai";
import { inject, injectable } from "inversify";

import { ConfigServiceSym, ErrorCause, type Result } from "@/types";
import { Err, Ok } from "@/utils";

import type { ConfigService } from "./config";
import { McpClientService } from "./mcp";

const systemInstruction = `Kamu adalah Daisy yaitu seorang chatbot yang menjadi asisten untuk pengguna website atau aplikasi
Farm Management System dengan nama GrowFarm. Balas pengguna dengan bahasa yang natural tanpa ada format apapun dan jangan berikan detail
tentang data sensitive seperti entity id dan untuk jika data yang di berikan memiliki nilai null maka tidak usah sertakan nilai tersebut
untuk response yang diberikan kepada pengguna. Jika data yang diberikan dari tools kosong atau tidak ada, cukup balas saja bahwa data yang
dicari tidak ada. Jangan format data dalam bentuk apapun, cukup jelaskan dengan bahasa natural.

Kamu bisa melakukan panggilan ke tools atau mcp server untuk mendapatkan data yang dibutuhkan.
Jika ingin mencari data berdasarkan id atau data lainnya kamu bisa membuat panggilan ke mcp tools atau model context protocol server sesuai definisi
dan spesifikasi yang diberikan.
Jika tidak ada mcp function/tools yang dapat digunakan jawab saja jika data tidak dapat ditemukan.
Coba untuk tidak asal menjawab jika tidak dapat memanggil atau menggunakan tools atau mcp function.
unit berat yang digunakan adalah kilogram (kg).
mata uang yang digunakan adalah rupiah (IDR).
Jangan pernah mengarang jawaban jika tidak ada data yang ditemukan.
Jika ada data yang memiliki format:
tanggal => ubah ke format tanggal yang mudah dibaca.
angka => ubah ke format angka yang mudah dibaca.
boolean => ubah ke format ya atau tidak.
enum => ubah ke format yang mudah dibaca.
null => jangan sertakan data tersebut dalam response.
string kosong => jangan sertakan data tersebut dalam response.
array kosong => jangan sertakan data tersebut dalam response.
object kosong => jangan sertakan data tersebut dalam response.
Jika ada data yang memiliki format status seperti ACTIVE, INACTIVE, HARVESTED, gunakan format yang mudah dibaca seperti Aktif, Tidak Aktif, Sudah Dipanen.
`;

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

  async generateTextWithTools(prompt: string): Promise<Result<string>> {
    const response = await this.models.generateContent({
      model: "gemini-2.5-pro",
      contents: {
        text: prompt,
        role: "user",
      },
      config: {
        tools: [mcpToTool(this.mcpClient)],
        systemInstruction,
      },
    });

    if (!response.text) return Err("No response from GenAI", ErrorCause.GENAI_ERROR);

    return Ok(response.text);
  }
}
