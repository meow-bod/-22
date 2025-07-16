// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';

export default function ProfilePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSitter, setIsSitter] = useState(false);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116: no rows found
          console.error('Error fetching profile:', error);
        } else if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setIsSitter(data.is_sitter || false);
        }
      }
      setLoading(false);
    };

    fetchUserAndProfile();
  }, [supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('users').upsert({
      id: user.id,
      full_name: fullName,
      phone,
      address,
      is_sitter: isSitter,
      updated_at: new Date().toISOString()
    });

    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      alert('Profile updated successfully!');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className='text-3xl font-bold mb-2 text-gray-800'>Your Profile</h1>
        <p className='mb-6 text-gray-600'>Manage your personal information and settings.</p>
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <p className="text-gray-800 text-base bg-gray-100 p-2 rounded">{user.email}</p>
        </div>
        <form onSubmit={handleUpdateProfile} className='space-y-6'>
        <div>
          <label htmlFor='fullName' className='block text-sm font-medium text-gray-700'>
            Full Name
          </label>
          <input
            id='fullName'
            type='text'
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className='mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm'
          />
        </div>
        <div>
          <label htmlFor='phone' className='block text-sm font-medium text-gray-700'>
            Phone
          </label>
          <input
            id='phone'
            type='text'
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className='mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm'
          />
        </div>
        <div>
          <label htmlFor='address' className='block text-sm font-medium text-gray-700'>
            Address
          </label>
          <input
            id='address'
            type='text'
            value={address}
            onChange={e => setAddress(e.target.value)}
            className='mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm'
          />
        </div>
        <div className='flex items-center'>
          <input
            id='isSitter'
            type='checkbox'
            checked={isSitter}
            onChange={e => setIsSitter(e.target.checked)}
            className='h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded'
          />
          <label htmlFor='isSitter' className='ml-2 block text-sm text-gray-900'>
            Are you a sitter?
          </label>
        </div>
        <button
          type='submit'
          className='w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
        >
          Update Profile
        </button>
      </form>
      </div>
    </div>
  );
}
