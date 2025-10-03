import type { Request, Response } from "express";

export type RequestURLParameters = {
  userId: string;
  projectId: string;
  farmId: string;
  activityId: string;
};

type Locals = {
  user: { id: string };
  query: Record<string, any>;
};

export type ExtendedRequest = Request<RequestURLParameters, any, any, Record<string, any>>;

export type ExtendedResponse = Response<any, Locals>;
