import type { Router } from "express";

export interface IHTTPRouter {
  path: string;
  router: Router;
}
