'use client';

import { User } from '@supabase/supabase-js';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { createClient } from '../../../lib/supabase/client';


interface Sitter {
  id: string;
  price_per_hour: number;
  users: {
    full_name: string;
  }[];
}

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [sitter, setSitter] = useState<Sitter | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sitterId = searchParams.get('sitterId');

  useEffect(() => {
    const init = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/booking/new?' + searchParams.toString());
        return;
      }
      setUser(user);

      if (!sitterId) {
        setError('缺少保姆資訊');
        setLoading(false);
        return;
      }

      const { data: sitterData, error: sitterError } = await supabase
        .from('sitters')
        .select('id, price_per_hour, users(full_name)')
        .eq('id', sitterId)
        .single();

      if (sitterError || !sitterData) {
        setError('找不到指定的保姆');
        setSitter(null);
      } else {
        setSitter(sitterData as Sitter);
      }
      setLoading(false);
    };

    init();
  }, [sitterId, router, supabase, searchParams]);

  useEffect(() => {
    if (startDate && endDate && sitter) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      if (start < end) {
        const hours = (end - start) / (1000 * 60 * 60);
        setTotalPrice(hours * sitter.price_per_hour);
      } else {
        setTotalPrice(0);
      }
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, sitter]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sitter || !startDate || !endDate || totalPrice <= 0) {
      setError('請填寫完整的預約資訊');
      return;
    }

    const { data: _data, error: bookingError } = await supabase.from('bookings').insert({
      user_id: user.id,
      sitter_id: sitter.id,
      start_time: new Date(startDate).toISOString(),
      end_time: new Date(endDate).toISOString(),
      total_price: totalPrice,
      status: 'pending'
    });

    if (bookingError) {
      setError('預約失敗，請稍後再試。');
      console.error('Booking Error:', bookingError);
    } else {
      router.push('/dashboard/bookings');
    }
  };

  if (loading) {
    return <div className='container mx-auto p-4'>載入中...</div>;
  }

  if (error) {
    return <div className='container mx-auto p-4 text-red-500'>{error}</div>;
  }

  if (!sitter) {
    return <div className='container mx-auto p-4'>找不到保姆資訊。</div>;
  }

  return (
    <div className='container mx-auto p-8 max-w-lg'>
      <h1 className='text-3xl font-bold mb-6'> 向 {sitter.users[0].full_name} 提出預約</h1>
      <form onSubmit={handleBooking} className='space-y-6 bg-white p-8 shadow-md rounded-lg'>
        <div>
          <label htmlFor='start-date' className='block text-sm font-medium text-gray-700'>
            開始時間
          </label>
          <input
            type='datetime-local'
            id='start-date'
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            required
          />
        </div>
        <div>
          <label htmlFor='end-date' className='block text-sm font-medium text-gray-700'>
            結束時間
          </label>
          <input
            type='datetime-local'
            id='end-date'
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            required
          />
        </div>
        <div className='p-4 bg-gray-100 rounded-lg'>
          <h3 className='font-semibold text-lg'>預估費用</h3>
          <p className='text-2xl font-bold'>NT$ {totalPrice.toFixed(0)}</p>
        </div>
        <button
          type='submit'
          className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        >
          確認預約
        </button>
      </form>
    </div>
  );
}
