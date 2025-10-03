import z from "zod/v3"; // ini yang bikin ribet, kenapa library mcp nya gak pake zod v4 aja dah

import { ToolBuilder } from "./types";
import { formatResponse, McpError, McpOk } from "./utils";

const getCurrentDate = ToolBuilder("get_current_date", "get current date", null, function () {
  return McpOk(`Current date is: ${new Date().toString()}`);
});

const getProjectData = ToolBuilder(
  "get_project_by_id",
  "Mengambil data proyek berdasarkan id yang diberikan",
  z.object({ projectId: z.string().min(26).describe("project id") }),
  async function (args) {
    try {
      const project = await this.prisma.project.findUnique({ where: { id: args.projectId } });

      if (!project) return McpError("project tidak dapat ditemukan");

      return McpOk(formatResponse(project));
    } catch (e) {
      return McpError(e);
    }
  },
);

const getFarmData = ToolBuilder(
  "get_farm_by_id",
  "Mengambil data farm berdasarkan id yang diberikan",
  z.object({ farmId: z.string().min(26).describe("farm id") }),
  async function (args) {
    try {
      const farm = await this.prisma.farm.findUnique({ where: { id: args.farmId } });

      if (!farm) return McpOk("farm tidak dapat ditemukan");

      return McpOk(formatResponse(farm));
    } catch (e) {
      return McpError(e);
    }
  },
);

const getProjectBatch = ToolBuilder(
  "get_project_batch",
  "Mengambil semua data project berdasarkan user id yang diberikan dan batasan data yang tertentu",
  z.object({
    userId: z.string().min(26).describe("user id"),
    skip: z.coerce.number().min(0).describe("nilai yang akan dilewati, default 0").optional().default(0),
    take: z.coerce.number().min(1).max(20).describe("jumlah data yang akan diambil, default 5").optional().default(5),
  }),
  async function (args) {
    try {
      const projects = await this.prisma.project.findMany({
        where: { user_id: args.userId },
        skip: args.skip,
        take: args.take,
      });

      if (!projects || projects.length === 0) return McpOk("project tidak dapat ditemukan");

      return McpOk(formatResponse(projects));
    } catch (e) {
      return McpError(e);
    }
  },
);

const getFarmBatch = ToolBuilder(
  "get_farm_batch",
  "Mengambil semua data farm/lahan/kebun berdasarkan project id yang diberikan dan batasan data yang tertentu",
  z.object({
    projectId: z.string().min(26).describe("project id"),
    skip: z.coerce.number().min(0).describe("nilai yang akan dilewati, default 0").optional().default(0),
    take: z.coerce.number().min(1).max(20).describe("jumlah data yang akan diambil, default 5").optional().default(5),
  }),
  async function (args) {
    try {
      const farms = await this.prisma.farm.findMany({
        where: { project_id: args.projectId },
        skip: args.skip,
        take: args.take,
      });

      if (!farms || farms.length === 0) return McpOk("farm tidak dapat ditemukan");

      return McpOk(formatResponse(farms));
    } catch (e) {
      return McpError(e);
    }
  },
);

const getFarmFilterByComodity = ToolBuilder(
  "get_farm_by_comodity",
  "Mengambil data farm/lahan/kebun berdasarkan komoditas yang diberikan",
  z.object({
    comodity: z.string().min(1).describe("komoditas, contoh: tomat"),
    take: z.coerce.number().min(1).max(10).describe("jumlah data yang akan diambil, default 5").optional().default(5),
    skip: z.coerce.number().min(0).describe("jumlah data yang akan di skip, default 0").optional().default(0),
  }),
  async function (args) {
    try {
      const farms = await this.prisma.farm.findMany({
        where: { comodity: { contains: args.comodity, mode: "insensitive" } },
        take: args.take,
        skip: args.skip,
      });

      if (!farms || farms.length === 0) return McpOk("farm tidak dapat ditemukan");

      return McpOk(formatResponse(farms));
    } catch (e) {
      return McpError(e);
    }
  },
);

const getProjectCount = ToolBuilder(
  "get_project_count",
  "Mengambil jumlah data project berdasarkan user id yang diberikan",
  z.object({ userId: z.string().min(26).describe("user id") }),
  async function (args) {
    try {
      const count = await this.prisma.project.count({
        where: { user_id: args.userId },
      });

      return McpOk(formatResponse({ count }));
    } catch (e) {
      return McpError(e);
    }
  },
);

const getFarmCount = ToolBuilder(
  "get_farm_count",
  "Mengambil jumlah data farm/lahan/kebun berdasarkan project id yang diberikan",
  z.object({ projectId: z.string().min(26).describe("project id") }),
  async function (args) {
    try {
      const count = await this.prisma.farm.count({
        where: { project_id: args.projectId },
      });

      return McpOk(formatResponse({ count }));
    } catch (e) {
      return McpError(e);
    }
  },
);

export default [
  getCurrentDate,
  getProjectData,
  getFarmData,
  getProjectBatch,
  getFarmBatch,
  getFarmFilterByComodity,
  getProjectCount,
  getFarmCount,
];
