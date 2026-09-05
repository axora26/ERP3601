import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { RequestContext } from "../types/request-context";

export const CurrentContext = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestContext => {
  const request = ctx.switchToHttp().getRequest<Request & { context?: RequestContext }>();
  if (!request.context) {
    throw new Error("CurrentContext used outside of SessionGuard");
  }
  return request.context;
});
