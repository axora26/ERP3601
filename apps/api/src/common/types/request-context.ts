export interface RequestContext {
  userId: string;
  email: string;
  displayName: string;
  sessionId: string;
  membershipId: string | null;
  activeOrganizationId: string | null;
  activeCompanyId: string | null;
  companyMembershipId: string | null;
}
