'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/auth-api';
import { signInWithGoogle, signOutFromFirebase } from '@/lib/firebase';
import { useRouter } from '@/i18n/routing';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading, setAuth, logout: logoutStore } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.accessToken);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (response) => {
      setAuth(response.user, response.accessToken);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: async (migrateSessionId?: string) => {
      const idToken = await signInWithGoogle();
      return authApi.googleLogin({ idToken, migrateSessionId });
    },
    onSuccess: (response) => {
      setAuth(response.user, response.accessToken);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.logout();
      await signOutFromFirebase();
    },
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
      router.push('/');
    },
  });

  const migrateProjectsMutation = useMutation({
    mutationFn: () => authApi.migrateProjects(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading,

    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegisterLoading: registerMutation.isPending,
    registerError: registerMutation.error,

    googleLogin: googleLoginMutation.mutate,
    googleLoginAsync: googleLoginMutation.mutateAsync,
    isGoogleLoginLoading: googleLoginMutation.isPending,
    googleLoginError: googleLoginMutation.error,

    logout: logoutMutation.mutate,
    isLogoutLoading: logoutMutation.isPending,

    migrateProjects: migrateProjectsMutation.mutate,
    isMigrateLoading: migrateProjectsMutation.isPending,
  };
}
