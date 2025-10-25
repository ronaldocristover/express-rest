export class ResponseError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResponseError);
    }
  }

  static badRequest(message: string): ResponseError {
    return new ResponseError(message, 400);
  }

  static unauthorized(message: string = 'Unauthorized'): ResponseError {
    return new ResponseError(message, 401);
  }

  static forbidden(message: string = 'Forbidden'): ResponseError {
    return new ResponseError(message, 403);
  }

  static notFound(message: string = 'Not Found'): ResponseError {
    return new ResponseError(message, 404);
  }

  static conflict(message: string): ResponseError {
    return new ResponseError(message, 409);
  }

  static internalServer(message: string = 'Internal Server Error'): ResponseError {
    return new ResponseError(message, 500);
  }

  static serviceUnavailable(message: string = 'Service Unavailable'): ResponseError {
    return new ResponseError(message, 503);
  }
}

export class ValidationError extends ResponseError {
  public details: any;

  constructor(message: string, details: any = null) {
    super(message, 400);
    this.details = details;
  }
}

export class DatabaseError extends ResponseError {
  constructor(message: string, originalError?: Error) {
    super(message, 500);
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

export class AuthenticationError extends ResponseError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends ResponseError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}