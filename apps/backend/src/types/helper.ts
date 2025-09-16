import type { ZodType } from "zod/v4";

import type Merror from "@/utils/merror";

export type PartialType<T, Q = any> = { [P in keyof T]?: Q };

export type Result<T, Q = Merror> = [T, Q];

export type ZodPartial<T> = PartialType<T, ZodType> | Record<string, ZodType>;

export interface BaseRepositoryInterface<T> {
  create(data: any, id?: string): Promise<Result<T>>;
  get(id: string): Promise<Result<T>>;
  update(id: string, data: any): Promise<Result<T>>;
  delete(id: string): Promise<Result<boolean>>;
}
