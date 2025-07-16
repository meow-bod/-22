'use client';

import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md'>
        <h2 className='text-2xl font-bold text-red-600'>驗證失敗</h2>
        <p className='text-gray-700'>
          {error || '發生了一個未知的錯誤，請稍後再試。'}
        </p>
        <a href="/auth/login" className='text-indigo-600 hover:text-indigo-500'>
          返回登入頁面
        </a>
      </div>
    </div>
  );
}