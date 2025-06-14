class ErrorResponse extends Error {
  statusCode: number;
  data: null;
  success: boolean;
  errors: string[] = [];

  constructor(
    statusCode: number,
    data: null,
    message: string = "Error",
    errors = [],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
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

export default { ErrorResponse };
