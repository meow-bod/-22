'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    password,
    passwordError,
    handlePasswordChange,
    validatePassword,
    setPassword,
  } = usePasswordValidation();

    const handleOAuthLogin = async (provider: 'google') => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!validatePassword(password)) {
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('註冊成功！請檢查您的電子郵件以進行驗證。');
        setEmail('');
        setPassword('');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md'>
        <h2 className='text-2xl font-bold text-center text-gray-900'>建立您的 Pawdner 帳戶</h2>
        <form className='space-y-6' onSubmit={handleSignUp}>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
              電子郵件
            </label>
            <input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            />
          </div>
          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
              密碼
            </label>
            <input
              id='password'
              name='password'
              type='password'
              autoComplete='current-password'
              required
              value={password}
              onChange={handlePasswordChange}
              className={`block w-full px-3 py-2 mt-1 placeholder-gray-400 border rounded-md shadow-sm appearance-none focus:outline-none sm:text-sm ${passwordError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
            />
            <ErrorMessage message={passwordError} />
          </div>
          <div>
                        <button
              type='submit'
              disabled={loading}
              className='flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? '註冊中...' : '使用 Email 註冊'}
            </button>
          </div>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white text-gray-500'>或者</span>
            </div>
          </div>
          <div>
            <button
              type='button'
              onClick={() => handleOAuthLogin('google')}
              className='flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            >
              <svg className='w-5 h-5 mr-2' aria-hidden='true' focusable='false' data-prefix='fab' data-icon='google' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 488 512'><path fill='currentColor' d='M488 261.8C488 403.3 381.5 512 244 512 111.3 512 0 398.5 0 256S111.3 0 244 0c69.9 0 131.5 28.4 176.9 74.2L345 151.4C318.2 128.2 282.7 112 244 112c-88.6 0-160.1 71.7-160.1 160.1s71.4 160.1 160.1 160.1c97.4 0 139.2-83.8 144.3-124.2H244v-89.1h244v-1.5z'></path></svg>
              使用 Google 帳戶註冊
            </button>
          </div>
        </form>
        <ErrorMessage message={error} />
        {success && <p className='mt-2 text-sm text-center text-green-600'>{success}</p>}
        <div className='text-sm text-center'>
          <Link href='/auth/login' className='font-medium text-indigo-600 hover:text-indigo-500'>
            已經有帳戶了？前往登入
          </Link>
        </div>
      </div>
    </div>
  );
}
