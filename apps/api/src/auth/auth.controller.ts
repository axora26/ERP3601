import { Body, Controller, Get, HttpCode, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import type { SessionContextDto } from "@axora/types";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { SwitchContextDto } from "./dto/switch-context.dto";
import { Public } from "../common/decorators/public.decorator";
import { CurrentContext } from "../common/decorators/current-context.decorator";
import type { RequestContext } from "../common/types/request-context";

const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS ?? 12);

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request & { requestId?: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionContextDto> {
    const result = await this.auth.login(dto.email, dto.password, {
      requestId: req.requestId ?? "unknown",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    this.setSessionCookie(res, result.token);
    return result.context;
  }

  @Post("logout")
  @HttpCode(204)
  async logout(
    @CurrentContext() context: RequestContext,
    @Req() req: Request & { requestId?: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.auth.logout(context.sessionId, { requestId: req.requestId ?? "unknown", userId: context.userId });
    res.clearCookie(process.env.SESSION_COOKIE_NAME ?? "axora_session");
  }

  @Get("me")
  async me(@CurrentContext() context: RequestContext): Promise<SessionContextDto> {
    return this.auth.buildSessionContext(context.userId, context.sessionId);
  }

  @Post("switch-context")
  @HttpCode(200)
  async switchContext(
    @Body() dto: SwitchContextDto,
    @CurrentContext() context: RequestContext,
    @Req() req: Request & { requestId?: string },
  ): Promise<SessionContextDto> {
    return this.auth.switchContext(context.sessionId, context.userId, dto.organizationId, dto.companyId, {
      requestId: req.requestId ?? "unknown",
    });
  }

  private setSessionCookie(res: Response, token: string): void {
    res.cookie(process.env.SESSION_COOKIE_NAME ?? "axora_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_TTL_HOURS * 60 * 60 * 1000,
      path: "/",
    });
  }
}
