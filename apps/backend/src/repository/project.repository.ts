import { inject, injectable } from "inversify";

import type { Project } from "@/entity";
import { Prisma } from "@/generated/prisma/client";
import PrismaService from "@/services/prisma";
import { AppError, ErrorCause } from "@/types/errors";
import type { BaseRepositoryInterface, Result } from "@/types/helper";
import { Err, Ok } from "@/utils";

export interface IProjectRepository extends BaseRepositoryInterface<Project> {
  getMany(userId: string, page: { skip?: number; take?: number }): Promise<Result<Project[]>>;
}

@injectable("Singleton")
export class ProjectRepository implements IProjectRepository {
  constructor(@inject(PrismaService) private readonly _prisma: PrismaService) {}

  async create(data: Project, userId: string): Promise<Result<Project>> {
    try {
      const project = await this._prisma.project.create({
        data: { ...data, user_id: userId },
      });

      return Ok(project);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async get(id: string): Promise<Result<Project>> {
    try {
      const project = await this._prisma.project.findFirstOrThrow({
        where: { id },
      });
      return Ok(project);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async update(id: string, data: Project): Promise<Result<Project>> {
    try {
      const project = await this._prisma.project.update({
        where: { id },
        data,
      });

      return Ok(project);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async delete(id: string): Promise<Result<boolean>> {
    try {
      await this._prisma.project.delete({
        where: { id },
      });

      return Ok(true);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getMany(userId: string, page: { skip: number; take: number }): Promise<Result<Project[]>> {
    try {
      const projects = await this._prisma.project.findMany({
        where: { user_id: userId },
        ...page,
      });

      // if (!projects || projects.length <= 0) {
      //   return Err(AppError.new("no projects found", ErrorCause.ENTRY_NOT_FOUND));
      // }

      // kalau gak ada project, return array kosong aja

      return Ok(projects);
    } catch (e) {
      return this.handleError(e);
    }
  }

  private handleError(e: any): Result<any> {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return Err(AppError.new("project already exists", ErrorCause.DUPLICATE_ENTRY));
      } else if (e.code === "P2025") {
        return Err(AppError.new("project not found", ErrorCause.ENTRY_NOT_FOUND));
      }
      return Err(AppError.new(e.message, ErrorCause.DATABASE_ERROR));
    }
    return Err(AppError.new("an unknown error occurred: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
  }
}
