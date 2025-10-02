import type { ZodType } from "zod";

import type Merror from "@/utils/merror";

export type PartialType<T, Q = any> = { [P in keyof T]?: Q };

export type Result<T, Q = Merror> = [T, Q];

export type ZodPartial<T> = PartialType<T, ZodType> | Record<string, ZodType>;

export type { ResponseBody as PaginatedObject } from "@/types/http";

export type PaginationParameters = { skip?: number; take?: number };

export interface BaseRepositoryInterface<T> {
  create(data: any, id?: string): Promise<Result<T>>;
  get(id: string): Promise<Result<T>>;
  update(id: string, data: any): Promise<Result<T>>;
  delete(id: string): Promise<Result<boolean>>;
}
