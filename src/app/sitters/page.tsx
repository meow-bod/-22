'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';

interface Sitter {
  id: string;
  service_area: string;
  introduction: string;
  price_per_hour: number;
  is_approved: boolean;
  created_at: string;
  users: {
    full_name: string;
    avatar_url: string;
  };
}

export default function SittersPage() {
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchArea, setSearchArea] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const supabase = createClient();
  const router = useRouter();

  const fetchSitters = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sitters')
        .select(
          `
          *,
          users (
            full_name,
            avatar_url
          )
        `
        )
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSitters(data || []);
    } catch (error) {
      console.error('獲取保姆資料失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSitters();
  }, [fetchSitters]);

  const filteredSitters = sitters.filter(sitter => {
    const matchesArea = !searchArea || sitter.service_area.toLowerCase().includes(searchArea.toLowerCase());
    const matchesPrice = sitter.price_per_hour >= priceRange.min && sitter.price_per_hour <= priceRange.max;
    return matchesArea && matchesPrice;
  });

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-lg'>載入中...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* 頁面標題 */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>尋找保姆</h1>
            <p className='text-gray-600'>為您的毛孩找到最適合的專業保姆</p>
          </div>
          <button onClick={() => router.push('/')} className='px-4 py-2 text-gray-600 hover:text-gray-800'>
            返回首頁
          </button>
        </div>

        {/* 搜尋和篩選 */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
          <h3 className='text-lg font-semibold mb-4'>搜尋篩選</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label htmlFor='search-area' className='block text-sm font-medium text-gray-700 mb-1'>服務地區</label>
              <input
                id='search-area'
                type='text'
                value={searchArea}
                onChange={e => setSearchArea(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='輸入地區關鍵字'
              />
            </div>
            <div>
              <label htmlFor='min-price' className='block text-sm font-medium text-gray-700 mb-1'>最低價格 (NT$/小時)</label>
              <input
                id='min-price'
                type='number'
                value={priceRange.min}
                onChange={e => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='0'
              />
            </div>
            <div>
              <label htmlFor='max-price' className='block text-sm font-medium text-gray-700 mb-1'>最高價格 (NT$/小時)</label>
              <input
                id='max-price'
                type='number'
                value={priceRange.max}
                onChange={e => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 1000 })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='1000'
              />
            </div>
          </div>
        </div>

        {/* 保姆列表 */}
        {filteredSitters.length === 0 ? (
          <div className='bg-white rounded-lg shadow-md p-8 text-center'>
            <div className='text-gray-500 mb-4'>
              <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>找不到符合條件的保姆</h3>
            <p className='text-gray-500'>請調整搜尋條件或稍後再試</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredSitters.map(sitter => (
              <div
                key={sitter.id}
                className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'
              >
                {/* 保姆頭像 */}
                <div className='p-6 text-center'>
                  <div className='w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center'>
                    {sitter.users?.avatar_url ? (
                      <Image
                        src={sitter.users.avatar_url}
                        alt={sitter.users?.full_name || '保姆'}
                        width={80}
                        height={80}
                        className='w-full h-full rounded-full object-cover'
                      />
                    ) : (
                      <svg className='w-10 h-10 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                        />
                      </svg>
                    )}
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>{sitter.users?.full_name || '匿名保姆'}</h3>
                  <div className='flex items-center justify-center text-green-600 mb-4'>
                    <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='text-sm font-medium'>已認證</span>
                  </div>
                </div>

                {/* 保姆資訊 */}
                <div className='px-6 pb-6'>
                  <div className='space-y-3'>
                    <div className='flex items-center text-sm text-gray-600'>
                      <svg className='w-4 h-4 mr-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                      </svg>
                      <span>{sitter.service_area}</span>
                    </div>
                    <div className='flex items-center text-sm text-gray-600'>
                      <svg className='w-4 h-4 mr-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                        />
                      </svg>
                      <span className='font-semibold text-blue-600'>NT$ {sitter.price_per_hour}/小時</span>
                    </div>
                  </div>

                  {/* 自我介紹 */}
                  <div className='mt-4'>
                    <p className='text-sm text-gray-600 line-clamp-3'>
                      {sitter.introduction.length > 100
                        ? `${sitter.introduction.substring(0, 100)}...`
                        : sitter.introduction}
                    </p>
                  </div>

                  {/* 查看詳情按鈕 */}
                  <div className='mt-6'>
                    <Link
                      href={`/sitters/${sitter.id}`}
                      className='w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                    >
                      查看詳情
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 統計資訊 */}
        <div className='mt-8 text-center text-gray-500'>
          <p>共找到 {filteredSitters.length} 位保姆</p>
        </div>
      </div>
    </div>
  );
}
