'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/components';
import { registerFormSchema, type RegisterForm } from '@/lib/validations';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<{
        user: any;
        tokens: { access_token: string; refresh_token: string };
      }>('/auth/register', {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        ntrp_level: data.ntrp_level,
      });

      login(response.user, response.tokens.access_token, response.tokens.refresh_token);
      toast.success('註冊成功！歡迎加入網球平台！');
      router.push('/profile/edit');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '註冊失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to home link */}
      <Link
        href="/"
        className="fixed top-6 left-6 text-gray-600 hover:text-emerald-600 flex items-center space-x-2 z-10"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>回到首頁</span>
      </Link>

      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            建立您的帳號
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            已經有帳號？{' '}
            <Link
              href="/login"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              立即登入
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="姓名"
              autoComplete="name"
              {...register('name')}
              error={errors.name?.message}
            />

            <Input
              label="電子郵件"
              type="email"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="手機號碼 (選填)"
              type="tel"
              autoComplete="tel"
              {...register('phone')}
              error={errors.phone?.message}
              helperText="格式：09xxxxxxxx"
            />

            <Input
              label="NTRP 等級 (選填)"
              type="number"
              step="0.5"
              min="1"
              max="7"
              {...register('ntrp_level', { valueAsNumber: true })}
              error={errors.ntrp_level?.message}
              helperText="1.0-7.0，0.5 為單位"
            />

            <Input
              label="密碼"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
            />

            <Input
              label="確認密碼"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                {...register('terms')}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                我同意{' '}
                <Link href="/terms" className="text-emerald-600 hover:text-emerald-500">
                  服務條款
                </Link>
                {' '}和{' '}
                <Link href="/privacy" className="text-emerald-600 hover:text-emerald-500">
                  隱私政策
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms.message}</p>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              註冊
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}