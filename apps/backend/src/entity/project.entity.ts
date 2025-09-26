import type { Farm, Project } from "@/generated/prisma/client";
import { aggregateProjectReportBatch, aggregateProjectReportOne } from "@/generated/prisma/sql";

export type { Project } from "@/generated/prisma/client";

export type ProjectWithFarms = Project & { farms: Farm[] };

export const ROW_TYPES = {
  PROJECT_TOTAL: "PROJECT_TOTAL",
  PROJECT_SUMMARY: "PROJECT_SUMMARY",
  FARM_DETAIL: "FARM_DETAIL",
} as const;

export type ProjectReportOne = Omit<aggregateProjectReportOne.Result, "row_type"> & {
  row_type: keyof typeof ROW_TYPES | (string & {}) | null;
};

export type ProjectReportMany = Omit<aggregateProjectReportBatch.Result, "row_type"> & {
  row_type: keyof typeof ROW_TYPES | (string & {}) | null;
};
