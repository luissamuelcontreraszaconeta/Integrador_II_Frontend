/**
 * Centralized API configuration and URL resolution for ExporTrace.
 * Guarantees that whether VITE_API_BASE_URL is provided with or without `/api`,
 * all API endpoints are constructed cleanly without duplication.
 */
const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const API_BASE_URL: string = RAW_API_URL.replace(/\/+$/, '').endsWith('/api')
  ? RAW_API_URL.replace(/\/+$/, '')
  : `${RAW_API_URL.replace(/\/+$/, '')}/api`;

export const BACKEND_ROOT_URL: string = API_BASE_URL.replace(/\/api\/?$/, '');

export const PUBLIC_APP_URL: string =
  (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');
