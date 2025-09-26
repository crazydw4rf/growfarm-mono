export interface ErrorProps<T> {
  error: T;
  message?: string;
}

export class Merror {
  private errorList: ErrorProps<Error>[] = [];

  constructor(error: Error) {
    this.errorList = [{ error }];
  }

  static new(err: Error): Merror {
    return new Merror(err);
  }

  wrap(error: Error, message?: string): Merror {
    this.errorList.push({ error, message });

    return this;
  }

  is(error: new (...args: any[]) => Error): boolean {
    for (const e of this.errorList) {
      if (e.error instanceof error) {
        return true;
      }
    }

    return false;
  }

  as<P extends Error>(errorClass: new (...args: any[]) => P): ErrorProps<P> | undefined {
    for (const e of this.errorList) {
      if (e.error instanceof errorClass) {
        return e as unknown as ErrorProps<P>;
      }
    }
  }

  get root(): ErrorProps<Error> | undefined {
    return this.errorList[0];
  }

  get message(): string | undefined {
    return this.errorList[this.errorList.length - 1]?.message;
  }

  get error(): Error | undefined {
    return this.errorList[this.errorList.length - 1]?.error;
  }
}

export default Merror;
