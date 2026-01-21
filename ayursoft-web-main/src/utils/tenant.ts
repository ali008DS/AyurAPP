/**
 * Utility functions for accessing tenant data
 */

interface TenantData {
  _id: string;
  name: string;
  domain: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get the stored tenant data from localStorage
 * @returns TenantData object or null if not available
 */
export const getTenantData = (): TenantData | null => {
  try {
    const tenantDataStr = localStorage.getItem('tenantData');
    if (!tenantDataStr) return null;
    return JSON.parse(tenantDataStr) as TenantData;
  } catch (error) {
    console.error('Error parsing tenant data:', error);
    return null;
  }
};

/**
 * Get the current tenant domain
 * @returns string domain or null
 */
export const getTenantDomain = (): string | null => {
  return localStorage.getItem('tenantDomain');
};

/**
 * Clear tenant data from localStorage
 */
export const clearTenantData = (): void => {
  localStorage.removeItem('tenantData');
  localStorage.removeItem('tenantDomain');
};

/**
 * Check if tenant data is available
 * @returns boolean
 */
export const hasTenantData = (): boolean => {
  return localStorage.getItem('tenantData') !== null;
};
