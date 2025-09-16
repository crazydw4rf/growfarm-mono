export interface ErrorProps<T> {
  error: T;
  message?: string;
}

export class Merror {
  private _errorList: ErrorProps<Error>[] = [];

  constructor(error: Error) {
    this._errorList = [{ error }];
  }

  static new(err: Error): Merror {
    return new Merror(err);
  }

  /**
   * Adds a new error and optional message to the error list.
   *
   * @param {Error} error - The error to wrap.
   * @param {string} [message] - An optional message describing the error context.
   * @returns {Merror} The current Merror instance for chaining.
   */
  wrap(error: Error, message?: string): Merror {
    this._errorList.push({ error, message });

    return this;
  }

  /**
   * Checks if any error in the error list is an instance of the provided error class.
   *
   * @param {new (...args: any[]) => Error} error - The error class to check against.
   * @returns {boolean} True if an error of the given class exists, false otherwise.
   */
  is(error: new (...args: any[]) => Error): boolean {
    for (const e of this._errorList) {
      if (e.error instanceof error) {
        return true;
      }
    }

    return false;
  }

  /**
   * Returns the first error in the list that matches the provided error class.
   *
   * @param {new (...args: any[]) => P} errorClass - The error class to match.
   * @returns {ErrorProps<P> | undefined} The matching error props or undefined.
   */
  as<P extends Error>(errorClass: new (...args: any[]) => P): ErrorProps<P> | undefined {
    for (const e of this._errorList) {
      if (e.error instanceof errorClass) {
        return e as unknown as ErrorProps<P>;
      }
    }
  }

  /**
   * Returns the root error from the error list.
   *
   * @returns {ErrorProps<Error> | undefined} The root error from the error list.
   */
  get root(): ErrorProps<Error> | undefined {
    return this._errorList[0];
  }

  /**
   * Returns the latest error message from the error list.
   *
   * @returns {string | undefined} The latest error message from the error list.
   */
  get message(): string | undefined {
    return this._errorList[this._errorList.length - 1]?.message;
  }

  /**
   * Returns latest error message from the error list.
   *
   * @returns {Error | undefined} The latest error from the error list.
   */
  get error(): Error | undefined {
    return this._errorList[this._errorList.length - 1]?.error;
  }
}

export default Merror;
