'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FormContainer,
  FormGroup,
  Label,
  Input,
  Button,
  ErrorMessage,
} from '@/components/ui/Form';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/'); // 登入成功後重定向到首頁
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer title='登入您的 Pawdner 帳戶'>
      <form className='space-y-6' onSubmit={handleLogin}>
        <FormGroup>
          <Label htmlFor='email'>電子郵件</Label>
          <Input
            id='email'
            name='email'
            type='email'
            autoComplete='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormGroup>
        <div>
                    <Button type='submit' className='w-full' disabled={loading}>
  {loading ? '登入中...' : '登入'}
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
            使用 Google 帳戶登入
          </Button>
        </div>
      </form>
      <ErrorMessage message={error} />
      <div className='text-sm text-center'>
        <Link href='/auth/signup' className='font-medium text-indigo-600 hover:text-indigo-500'>
          還沒有帳戶嗎？前往註冊
        </Link>
      </div>
    </FormContainer>
  );
}
