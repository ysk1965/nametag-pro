'use client';

import { useRouter } from '@/i18n/routing';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/editor');
  };

  return <RegisterForm onSuccess={handleSuccess} />;
}
