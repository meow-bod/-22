'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  sitters: {
    users: {
      full_name: string;
    };
  };
  users: { // This is the owner
    full_name: string;
  };
}

export default function BookingsPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [bookingsAsOwner, setBookingsAsOwner] = useState<Booking[]>([]);
  const [bookingsAsSitter, setBookingsAsSitter] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch bookings where the user is the owner
        const { data: ownerBookings, error: ownerError } = await supabase
          .from('bookings')
          .select('*, sitters(users(full_name))')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false });

        if (ownerError) console.error('Error fetching owner bookings:', ownerError);
        else setBookingsAsOwner(ownerBookings as any);

        // Fetch bookings where the user is the sitter
        const { data: sitterBookings, error: sitterError } = await supabase
          .from('bookings')
          .select('*, users(full_name)')
          .eq('sitter_id', user.id) // Assuming sitter_id in bookings is the user's id
          .order('start_time', { ascending: false });
        
        if (sitterError) console.error('Error fetching sitter bookings:', sitterError);
        else setBookingsAsSitter(sitterBookings as any);
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const renderBookingCard = (booking: Booking, role: 'owner' | 'sitter') => (
    <div key={booking.id} className="bg-white p-4 rounded-lg shadow-md">
      <p className="font-bold text-lg">
        {role === 'owner' ? `與 ${booking.sitters?.users?.full_name || '保姆'} 的預約` : `與 ${booking.users?.full_name || '飼主'} 的預約`}
      </p>
      <p>開始: {new Date(booking.start_time).toLocaleString()}</p>
      <p>結束: {new Date(booking.end_time).toLocaleString()}</p>
      <p>費用: NT$ {booking.total_price}</p>
      <p>狀態: <span className={`px-2 py-1 rounded-full text-sm font-semibold ${booking.status === 'confirmed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{booking.status}</span></p>
    </div>
  );

  if (loading) {
    return <div className="container mx-auto p-4">載入預約紀錄中...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">我的預約紀錄</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">我是飼主</h2>
        {bookingsAsOwner.length > 0 ? (
          <div className="space-y-4">
            {bookingsAsOwner.map(b => renderBookingCard(b, 'owner'))}
          </div>
        ) : (
          <p>您目前沒有任何預約。</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">我是保姆</h2>
        {bookingsAsSitter.length > 0 ? (
          <div className="space-y-4">
            {bookingsAsSitter.map(b => renderBookingCard(b, 'sitter'))}
          </div>
        ) : (
          <p>您目前沒有任何服務預約。</p>
        )}
      </div>
    </div>
  );
}