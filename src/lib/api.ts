import { useAuth } from '../hooks/useAuth';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Enhanced fetch wrapper with automatic authentication headers,
 * 401 Unauthorized detection, and uniform error handling.
 */
export async function fetchWithAuth(url: string, options: RequestOptions = {}): Promise<Response> {
  const { skipAuth = false, headers = {}, ...rest } = options;

  const requestHeaders = new Headers(headers);

  if (!skipAuth && !requestHeaders.has('Authorization')) {
    const token = useAuth.getState().token || localStorage.getItem('token');
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  if (!requestHeaders.has('Content-Type') && !(rest.body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
  });

  // Handle 401 Unauthorized: token expired, invalid, or user removed
  if (response.status === 401 && !skipAuth) {
    const currentToken = useAuth.getState().token;
    // Only trigger session expired if user previously held a token
    if (currentToken) {
      console.warn(`[API] 401 Unauthorized received for ${url}. Expiring session.`);
      useAuth.getState().handleSessionExpired();
    }
  }

  return response;
}

/**
 * Helper methods for JSON API requests.
 */
export const api = {
  async get<T = any>(url: string, options?: RequestOptions): Promise<T> {
    const res = await fetchWithAuth(url, { ...options, method: 'GET' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(err.message || `Request failed with status ${res.status}`, res.status, err);
    }
    return res.json();
  },

  async post<T = any>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    const res = await fetchWithAuth(url, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(err.message || `Request failed with status ${res.status}`, res.status, err);
    }
    return res.json();
  },

  async put<T = any>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    const res = await fetchWithAuth(url, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(err.message || `Request failed with status ${res.status}`, res.status, err);
    }
    return res.json();
  },

  async delete<T = any>(url: string, options?: RequestOptions): Promise<T> {
    const res = await fetchWithAuth(url, { ...options, method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(err.message || `Request failed with status ${res.status}`, res.status, err);
    }
    return res.json();
  },
};
