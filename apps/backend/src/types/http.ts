import type { Router } from "express";

export interface IHTTPRouter {
  path: string;
  router: Router;
}

export type ResponseBody<T extends any[] | object> = T extends any[]
  ? {
      data: T;
      skip: number;
      take: number;
      count: number;
      error?: any;
    }
  : Record<string, any>;
