/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { inject, injectable } from "inversify";
import { Format } from "logform";
import { createLogger, format, Logger, transports } from "winston";

import { ConfigService } from "./config";

// TODO: add winston-loki transport
// output to console or file?
@injectable("Singleton")
export class LoggingService {
  private _logger: Logger;

  constructor(@inject(ConfigService) private readonly config: ConfigService) {
    this._logger = createLogger({
      level: this.config.env.APP_ENV === "production" ? "info" : "debug",
      transports: [new transports.Console()],
      format: this.setLogFormat(),
    });
  }

  info(message: string, meta?: Record<string, any>): void {
    this._logger.info(message, meta);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this._logger.warn(message, meta);
  }

  error(message: string, meta?: Record<string, any>): void {
    this._logger.error(message, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    this._logger.debug(message, meta);
  }

  withLabel(label: string): Logger {
    return this._logger.child({ label });
  }

  private setLogFormat(): Format {
    if (this.config.env.APP_ENV === "production") {
      return format.json();
    }

    return format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf((t): string => {
        const { level, message, timestamp, ...restProps } = t;

        let metaString = "";
        if (Object.keys(restProps).length > 0) {
          try {
            metaString =
              "\n" +
              Object.entries(restProps)
                .map(([key, value]) => {
                  // Safely serialize the value
                  let serializedValue: string;
                  try {
                    if (value === undefined) {
                      serializedValue = "undefined";
                    } else if (value === null) {
                      serializedValue = "null";
                    } else if (typeof value === "object") {
                      serializedValue = JSON.stringify(value, null, 2);
                    } else if (typeof value === "string") {
                      serializedValue = value;
                    } else {
                      serializedValue = JSON.stringify(value);
                    }
                  } catch {
                    serializedValue = "[Circular or Non-serializable]";
                  }
                  return `  ${key}: ${serializedValue}`;
                })
                .join("\n");
          } catch {
            metaString = "\n  [Error serializing metadata]";
          }
        }

        return `${timestamp} [${level}]: ${message}${metaString}`;
      })
    );
  }
}
