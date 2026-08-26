import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Request, Response } from "express";
import type { ApiErrorBody } from "@axora/types";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.getResponse() : "Internal server error";
    const code = exception instanceof HttpException ? exception.constructor.name : "InternalServerError";

    const body: ApiErrorBody = {
      requestId: request.requestId ?? "unknown",
      code,
      message: typeof message === "string" ? message : JSON.stringify(message),
    };

    response.status(status).json(body);
  }
}
