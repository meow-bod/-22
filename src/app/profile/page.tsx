// src/app/profile/page.tsx
'use client';

import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { FormContainer, FormGroup, Label, Input, Button, Checkbox } from '@/components/ui/Form';

export default function ProfilePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [user, setUser] = useState<User | null>(null);
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
    return <div className='text-center p-8'>Loading...</div>;
  }

  if (!user) {
    return <div className='text-center p-8'>Please log in to view your profile.</div>;
  }

  return (
    <FormContainer title='您的個人資料' description='管理您的個人資訊與設定。'>
      <form onSubmit={handleUpdateProfile} className='space-y-6'>
        <FormGroup>
          <Label htmlFor='email'>電子郵件</Label>
          <Input id='email' type='email' value={user.email || ''} disabled />
        </FormGroup>
        <FormGroup>
          <Label htmlFor='fullName'>全名</Label>
          <Input
            id='fullName'
            type='text'
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder='輸入您的全名'
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor='phone'>電話</Label>
          <Input
            id='phone'
            type='tel'
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder='輸入您的電話號碼'
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor='address'>地址</Label>
          <Input
            id='address'
            type='text'
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder='輸入您的地址'
          />
        </FormGroup>
        <FormGroup className='flex items-center space-x-2'>
          <Checkbox id='isSitter' checked={isSitter} onCheckedChange={(checked: boolean) => setIsSitter(checked)} />
          <Label
            htmlFor='isSitter'
            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            我是一位保姆
          </Label>
        </FormGroup>
        <Button type='submit'>更新個人資料</Button>
      </form>
    </FormContainer>
  );
}
