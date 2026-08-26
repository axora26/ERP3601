import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "axora:public-route";

/** Marks a route as not requiring an authenticated session (e.g. health, login). */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
