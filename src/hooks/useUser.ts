'use client';

import { type User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

import { createClient } from '../lib/supabase/client';

export function useUser() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 立即獲取一次當前使用者狀態
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getCurrentUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading };
}