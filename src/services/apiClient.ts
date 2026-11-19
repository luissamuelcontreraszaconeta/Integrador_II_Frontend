import { API_BASE_URL } from './apiConfig';
import { authService } from '../auth/auth.service';

const TOKEN_KEY = 'exportrace_jwt_token';

export interface ApiError extends Error {
  status?: number;
  errorCode?: string;
  technicalRequestId?: string;
  fieldErrors?: Record<string, string>;
  isNetworkError?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch (netErr: any) {
    const apiError: ApiError = new Error(
      'No se pudo establecer conexión con el servidor de ExporTrace. Verifique su red o disponibilidad del servicio.'
    );
    apiError.status = 0;
    apiError.errorCode = 'NETWORK_ERROR';
    apiError.isNetworkError = true;
    apiError.technicalRequestId = `net-${Date.now()}`;
    throw apiError;
  }

  // Handle 401 Unauthorized by attempting token refresh (unless calling login or refresh itself)
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    const newToken = await authService.refreshToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers,
      });
    } else {
      // Refresh failed or session expired
      authService.handleSessionExpired('SESSION_EXPIRED');
    }
  }

  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
    let fieldErrors: Record<string, string> | undefined;
    let errorCode = `HTTP_${response.status}`;
    let technicalRequestId =
      response.headers.get('X-Request-Id') ||
      response.headers.get('X-Correlation-Id') ||
      `req-${response.status}-${Date.now().toString(36)}`;

    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      if (errorData.errorCode || errorData.code) {
        errorCode = String(errorData.errorCode || errorData.code);
      }
      if (errorData.correlationId || errorData.requestId || errorData.traceId) {
        technicalRequestId = String(errorData.correlationId || errorData.requestId || errorData.traceId);
      }
      if (errorData.errors && typeof errorData.errors === 'object') {
        fieldErrors = errorData.errors as Record<string, string>;
      }
    } catch {
      // JSON parse error fallback
    }
    const apiError: ApiError = new Error(errorMessage);
    apiError.status = response.status;
    apiError.errorCode = errorCode;
    apiError.technicalRequestId = technicalRequestId;
    if (fieldErrors) {
      apiError.fieldErrors = fieldErrors;
    }
    throw apiError;
  }

  return response.json() as Promise<T>;
}
