import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message: string, details?: Record<string, string>) {
  return new ApiError(400, "bad_request", message, details);
}

export function notFound(message = "Menu item not found") {
  return new ApiError(404, "not_found", message);
}

export function datastoreError(message: string, details?: Record<string, string>) {
  return new ApiError(500, "datastore_error", message, details);
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof SyntaxError && "body" in error) {
    return sendApiError(res, badRequest("Request body must be valid JSON"));
  }

  if (error instanceof ApiError) {
    return sendApiError(res, error);
  }

  console.error(error);
  return sendApiError(
    res,
    new ApiError(500, "server_error", "Something went wrong")
  );
}

function sendApiError(res: Response, error: ApiError) {
  return res.status(error.status).json({
    error: {
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {})
    }
  });
}
