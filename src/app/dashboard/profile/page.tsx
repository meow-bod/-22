'use client';

import { type User } from '@supabase/supabase-js';
import { useState, useEffect, useCallback } from 'react';

import Avatar from '../../../components/ui/Avatar';
import { createClient } from '../../../lib/supabase/client';

export default function ProfilePage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const getProfile = useCallback(
    async (user: User) => {
      try {
        setLoading(true);
        const { data, error, status } = await supabase
          .from('profiles')
          .select(`full_name, website, avatar_url`)
          .eq('id', user.id)
          .single();

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          setFullName(data.full_name || '');
          setWebsite(data.website || '');
          setAvatarUrl(data.avatar_url || '');
        }
      } catch (error) {
        console.error('Error loading user data!', error);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase.auth]);

  useEffect(() => {
    if (user) {
      getProfile(user);
    }
  }, [user, getProfile]);

  async function updateProfile({
    fullName,
    website,
    avatarUrl
  }: {
    fullName: string;
    website: string;
    avatarUrl: string;
  }) {
    if (!user) return;

    if (!fullName.trim()) {
      alert('全名不能為空。');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        website: website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      });

      if (error) {
        throw error;
      }
      alert('個人資料已更新！');
    } catch (error) {
      console.error('Error updating the data!', error);
      alert('更新個人資料時發生錯誤。');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>讀取中...</div>;
  }

  if (!user) {
    return <div>請先登入</div>;
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>個人資料</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          updateProfile({ fullName, website, avatarUrl });
        }}
        className='space-y-4'
      >
        <Avatar
          uid={user.id}
          url={avatarUrl}
          size={150}
          onUpload={url => {
            setAvatarUrl(url);
            updateProfile({ fullName, website, avatarUrl: url });
          }}
        />
        <div>
          <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
            Email
          </label>
          <input
            id='email'
            type='text'
            value={user.email}
            disabled
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100'
          />
        </div>
        <div>
          <label htmlFor='fullName' className='block text-sm font-medium text-gray-700'>
            全名
          </label>
          <input
            id='fullName'
            type='text'
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>
        <div>
          <label htmlFor='website' className='block text-sm font-medium text-gray-700'>
            網站
          </label>
          <input
            id='website'
            type='url'
            value={website}
            onChange={e => setWebsite(e.target.value)}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>
        <div>
          <button
            type='submit'
            className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            disabled={loading}
          >
            {loading ? '更新中...' : '更新個人資料'}
          </button>
        </div>
      </form>
    </div>
  );
}
