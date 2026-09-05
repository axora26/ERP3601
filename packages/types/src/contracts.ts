export interface SessionContextDto {
  userId: string;
  email: string;
  displayName: string;
  activeOrganizationId: string | null;
  activeCompanyId: string | null;
  organizations: OrganizationSummaryDto[];
}

export interface OrganizationSummaryDto {
  id: string;
  name: string;
  slug: string;
  companies: CompanySummaryDto[];
}

export interface CompanySummaryDto {
  id: string;
  code: string;
  name: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface SwitchContextRequestDto {
  organizationId: string;
  companyId?: string | null;
}

export interface ApiErrorBody {
  requestId: string;
  code: string;
  message: string;
}
