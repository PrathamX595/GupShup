export class ErrorResponse extends Error {
  statusCode: number;
  success: boolean;
  errors: string[] = [];

  constructor(
    statusCode: number,
    message: string = "Error",
    errors = [],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ErrorResponse;
