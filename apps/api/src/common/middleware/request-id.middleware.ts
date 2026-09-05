import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export class RequestIdMiddleware {
  use = (req: Request, res: Response, next: NextFunction): void => {
    const requestId = randomUUID();
    (req as Request & { requestId: string }).requestId = requestId;
    res.setHeader("x-request-id", requestId);
    next();
  };
}
