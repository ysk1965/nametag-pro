'use client';

import { useRouter } from '@/i18n/routing';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/editor');
  };

  return <LoginForm onSuccess={handleSuccess} />;
}
