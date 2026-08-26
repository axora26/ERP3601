/**
 * Product identity is configuration, not a hardcoded literal scattered
 * through the app (mission Section 3). Every place that needs to show the
 * product/company name reads from here (server) or NEXT_PUBLIC_APP_NAME
 * (browser), never a string literal.
 */
export interface BrandingConfig {
  productName: string;
  companyName: string;
  legalFooter: string;
}

export const DEFAULT_BRANDING: BrandingConfig = {
  productName: "AXORA ONE",
  companyName: "AXORA GROUP SARLU",
  legalFooter: "AXORA ONE — enterprise operating system for construction and engineering.",
};
