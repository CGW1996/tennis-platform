'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/components';
import { forgotPasswordSchema, type ForgotPasswordForm } from '@/lib/validations';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', data);
      setIsSubmitted(true);
      toast.success('密碼重設郵件已發送！');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '發送失敗');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100">
              <svg
                className="h-6 w-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              郵件已發送
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              請檢查您的信箱，按照郵件中的指示重設密碼。
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                返回登入
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            忘記密碼
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            輸入您的電子郵件地址，我們將發送重設密碼的連結給您。
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="電子郵件"
            type="email"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              發送重設連結
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              返回登入
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}