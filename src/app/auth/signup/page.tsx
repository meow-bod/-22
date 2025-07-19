'use client';

import Link from 'next/link';
import { useState } from 'react';

import { FormContainer, FormGroup, Label, Input, Button } from '@/components/ui/Form';
import ErrorMessage from '@/components/ui/messages/ErrorMessage';
import SuccessMessage from '@/components/ui/messages/SuccessMessage';
import { usePasswordValidation } from '@/lib/hooks/usePasswordValidation';
import { createClient } from '@/lib/supabase/client';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    password,
    passwordError,
    criteriaMet,
    passwordCriteria,
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
    <FormContainer title='建立您的 Pawdner 帳戶'>
      <ErrorMessage message={error} />
      <SuccessMessage message={success} />
      <form className='space-y-6' onSubmit={handleSignUp}>
        <FormGroup>
          <Label htmlFor='email'>電子郵件</Label>
          <Input
            id='email'
            name='email'
            type='email'
            autoComplete='email'
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor='password'>密碼</Label>
          <Input
            id='password'
            name='password'
            type='password'
            autoComplete='current-password'
            required
            value={password}
            onChange={handlePasswordChange}
            className={`${passwordError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
          />
          <ErrorMessage message={passwordError} />
          <div className='mt-2 space-y-1'>
            {Object.entries(passwordCriteria).map(([key, { message }]) => (
              <div key={key} className={`flex items-center text-sm ${criteriaMet[key as keyof typeof criteriaMet] ? 'text-green-600' : 'text-gray-500'}`}>
                <svg className={`w-4 h-4 mr-2 fill-current ${criteriaMet[key as keyof typeof criteriaMet] ? '' : 'hidden'}`} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                <svg className={`w-4 h-4 mr-2 fill-current ${criteriaMet[key as keyof typeof criteriaMet] ? 'hidden' : ''}`} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.707a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 00-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 101.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z' clipRule='evenodd' />
                </svg>
                {message}
              </div>
            ))}
          </div>
        </FormGroup>
        <div>
          <Button type='submit' disabled={loading}>
            {loading ? '註冊中...' : '使用 Email 註冊'}
          </Button>
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
          <Button
            type='button'
            onClick={() => handleOAuthLogin('google')}
            className='w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          >
            <svg className='w-5 h-5 mr-2' aria-hidden='true' focusable='false' data-prefix='fab' data-icon='google' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 488 512'><path fill='currentColor' d='M488 261.8C488 403.3 381.5 512 244 512 111.3 512 0 398.5 0 256S111.3 0 244 0c69.9 0 131.5 28.4 176.9 74.2L345 151.4C318.2 128.2 282.7 112 244 112c-88.6 0-160.1 71.7-160.1 160.1s71.4 160.1 160.1 160.1c97.4 0 139.2-83.8 144.3-124.2H244v-89.1h244v-1.5z'></path></svg>
            使用 Google 帳戶註冊
          </Button>
        </div>
      </form>
      <div className='text-sm text-center'>
        <Link href='/auth/login' className='font-medium text-indigo-600 hover:text-indigo-500'>
          已經有帳戶了？前往登入
        </Link>
      </div>
    </FormContainer>
  );
}
