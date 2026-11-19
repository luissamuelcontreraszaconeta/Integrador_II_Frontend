/**
 * Centralized API configuration and URL resolution for ExporTrace.
 * Guarantees that whether VITE_API_BASE_URL is provided with or without `/api`,
 * all API endpoints are constructed cleanly without duplication.
 *
 * SECURITY: No Jira API token, account email, or Basic Auth secret is ever stored or read in the frontend.
 */
const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const API_BASE_URL: string = RAW_API_URL.replace(/\/+$/, '').endsWith('/api')
  ? RAW_API_URL.replace(/\/+$/, '')
  : `${RAW_API_URL.replace(/\/+$/, '')}/api`;

export const BACKEND_ROOT_URL: string = API_BASE_URL.replace(/\/api\/?$/, '');

export const PUBLIC_APP_URL: string =
  (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

/**
 * URL pública del Portal de Soporte Jira Service Management para contingencia cuando el backend está caído.
 * Es únicamente un enlace público de navegador; nunca contiene credenciales ni API tokens.
 */
export const JIRA_PORTAL_PUBLIC_URL: string =
  (import.meta.env.VITE_JIRA_PORTAL_URL as string | undefined) ||
  'https://utp-team-f25gkbq9.atlassian.net/servicedesk/customer/portal/2';
