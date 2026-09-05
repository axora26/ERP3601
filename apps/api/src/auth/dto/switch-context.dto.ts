import { IsOptional, IsUUID } from "class-validator";

export class SwitchContextDto {
  @IsUUID()
  organizationId!: string;

  @IsOptional()
  @IsUUID()
  companyId?: string | null;
}
