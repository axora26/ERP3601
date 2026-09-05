import { SetMetadata } from "@nestjs/common";
import type { PermissionKey } from "@axora/types";

export const PERMISSIONS_KEY = "axora:required-permissions";

export const RequirePermissions = (...permissions: PermissionKey[]): MethodDecorator & ClassDecorator =>
  SetMetadata(PERMISSIONS_KEY, permissions);
