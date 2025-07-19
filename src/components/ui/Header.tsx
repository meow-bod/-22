'use client';

import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { createClient } from '../../utils/supabase/client';

const Header = () => {
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
        if (data && data.is_admin) {
          setIsAdmin(true);
        }
      }
    };
    checkAdmin();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          checkAdmin();
        } else if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header className='bg-white shadow-md'>
      <nav className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center'>
            <Link href='/' className='text-2xl font-bold text-primary'>
              Pawdner
            </Link>
          </div>
          <div className='hidden md:block'>
            <div className='ml-10 flex items-baseline space-x-4'>
              <Link
                href='/search'
                className='text-text-subtle hover:text-primary px-3 py-2 rounded-md text-sm font-medium'
              >
                尋找保姆
              </Link>
              <Link
                href='/dashboard/profile'
                className='text-text-subtle hover:text-primary px-3 py-2 rounded-md text-sm font-medium'
              >
                個人資料
              </Link>
              <Link
                href='/dashboard/pets'
                className='text-text-subtle hover:text-primary px-3 py-2 rounded-md text-sm font-medium'
              >
                我的寵物
              </Link>
              <Link
                href='/dashboard/swipe'
                className='text-text-subtle hover:text-primary px-3 py-2 rounded-md text-sm font-medium'
              >
                尋找夥伴
              </Link>
              <Link
                href='/dashboard/matches'
                className='text-text-subtle hover:text-primary px-3 py-2 rounded-md text-sm font-medium'
              >
                我的配對
              </Link>
              {isAdmin && (
                <Link
                  href='/admin/certification'
                  className='text-red-500 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium'
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          {/* Mobile menu button can be added here */}
        </div>
      </nav>
    </header>
  );
};

export default Header;
