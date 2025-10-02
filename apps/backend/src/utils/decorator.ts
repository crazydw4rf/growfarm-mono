import type { NextFunction } from "express";
import { z } from "zod";

import { AppError, ErrorCause } from "@/types/errors";
import type { ExtendedRequest, ExtendedResponse, RequestURLParameters } from "@/types/express";

type ExpressFunctionHandler = (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction) => Promise<void>;

export function ValidatePayload(zz: z.ZodObject): MethodDecorator {
  // @ts-expect-error: Gak tau dah typescript bilang error mulu disini
  return function (_target: object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<ExpressFunctionHandler>): void {
    const func = descriptor.value!;

    descriptor.value = async function (req, res, next) {
      try {
        req.body = zz.parse(req.body);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
      } catch (e) {
        throw AppError.new("validation error", ErrorCause.VALIDATION_ERROR);
      }

      await func.apply(this, [req, res, next]);
    };
  };
}

export function ValidateQuery(zz: z.ZodObject): MethodDecorator {
  // @ts-expect-error: Gak tau dah typescript bilang error mulu disini
  return function (_target: object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<ExpressFunctionHandler>): void {
    const func = descriptor.value!;

    descriptor.value = async function (req, res, next) {
      try {
        const parsed = zz.parse(req.query);
        res.locals.query = parsed;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
      } catch (e) {
        throw AppError.new("query validation error", ErrorCause.VALIDATION_ERROR);
      }

      await func.apply(this, [req, res, next]);
    };
  };
}

// TODO: improve parameter validation to support multiple parameters
export function ValidateParams(paramName: keyof RequestURLParameters, zz: z.ZodType): MethodDecorator {
  // @ts-expect-error: Gak tau dah typescript bilang error mulu disini
  return function (_target: object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<ExpressFunctionHandler>): void {
    const func = descriptor.value!;

    descriptor.value = async function (req, res, next) {
      try {
        zz.parse(req.params[paramName]);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
      } catch (e) {
        throw AppError.new("query validation error", ErrorCause.VALIDATION_ERROR);
      }

      await func.apply(this, [req, res, next]);
    };
  };
}

// TODO: buat decorator untuk validasi dan verifikasi jwt token
