import { useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiError extends Error {
  code: string;
  details?: Record<string, string>;

  constructor(
    message: string,
    code: string,
    details?: Record<string, string>
  ) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        refreshToken: '',
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    useAuthStore.getState().setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
        credentials: 'include',
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || 'Request failed',
          errorData.code || 'UNKNOWN_ERROR',
          errorData.details
        );
      }

      return retryResponse.json();
    } else {
      useAuthStore.getState().logout();
      throw new ApiError('Session expired', 'SESSION_EXPIRED');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || 'Request failed',
      errorData.code || 'UNKNOWN_ERROR',
      errorData.details
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export { ApiError };
