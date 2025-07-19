'use client';

import { type User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';

export function useUser() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    fetchUser();
  }, [supabase]);

  return { user, loading };
}