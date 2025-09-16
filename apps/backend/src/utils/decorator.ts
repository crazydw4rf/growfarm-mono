import type { NextFunction, Request } from "express";
import type { ZodObject } from "zod/v4";

import { AppError, ErrorCause } from "@/types/errors";
import type { ExtendedResponse } from "@/types/express";

type ExpressFunctionHandler = (req: Request, res: ExtendedResponse, next: NextFunction) => Promise<void>;

export function ValidatePayload(z: ZodObject): MethodDecorator {
  // @ts-expect-error: Gak tau dah typescript bilang error mulu disini
  return function (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<ExpressFunctionHandler>
  ): void {
    const func = descriptor.value!;

    descriptor.value = async function (req, res, next) {
      try {
        req.body = z.parse(req.body);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
      } catch (e) {
	      console.debug(e)
        throw AppError.new("validation error", ErrorCause.VALIDATION_ERROR);
      }

      await func.apply(this, [req, res, next]);
    };
  };
}

export function ValidateQuery(z: ZodObject): MethodDecorator {
  // @ts-expect-error: Gak tau dah typescript bilang error mulu disini
  return function (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<ExpressFunctionHandler>
  ): void {
    const func = descriptor.value!;

    descriptor.value = async function (req, res, next) {
      try {
        const parsed = z.parse(req.query);
        res.locals.query = parsed;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
      } catch (e) {
        throw AppError.new("query validation error", ErrorCause.VALIDATION_ERROR);
      }

      await func.apply(this, [req, res, next]);
    };
  };
}

// TODO: buat decorator untuk validasi req.params

// TODO: buat decorator untuk validasi dan verifikasi jwt token
