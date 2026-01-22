import { apiRequest } from './api-client';
import type { User } from '@/stores/auth-store';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  newUser: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface GoogleLoginRequest {
  idToken: string;
  migrateSessionId?: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  googleLogin: async (data: GoogleLoginRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/api/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  logout: async (): Promise<void> => {
    return apiRequest<void>('/api/v1/auth/logout', {
      method: 'POST',
    });
  },

  getMe: async (): Promise<{ user: User }> => {
    return apiRequest<{ user: User }>('/api/v1/auth/me');
  },

  migrateProjects: async (): Promise<{ migratedCount: number; message: string }> => {
    return apiRequest<{ migratedCount: number; message: string }>(
      '/api/v1/auth/migrate-projects',
      {
        method: 'POST',
      }
    );
  },
};
