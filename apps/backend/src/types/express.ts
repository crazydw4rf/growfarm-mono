import type { Request, Response } from "express";

type RequestParams = {
  userId: string;
  projectId: string;
  farmId: string;
};

type Locals = {
  user: {
    id: string;
    role: string;
  };
  query: Record<string, any> & PaginationParams;
};

type PaginationParams = {
  skip?: number;
  take?: number;
};

export type ExtendedRequest = Request<RequestParams, any, any, Record<string, any> & PaginationParams>;

export type ExtendedResponse = Response<any, Locals>;
