'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SitterDetail {
  id: string;
  service_area: string;
  introduction: string;
  price_per_hour: number;
  qualifications: string;
  is_approved: boolean;
  is_certified: boolean; // 新增認證狀態
  created_at: string;
  users: {
    id: string;
    full_name: string;
    avatar_url: string;
    email: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  users: {
    full_name: string;
  };
}

export default function SitterDetailPage({ params }: { params: { id: string } }) {
  const [sitter, setSitter] = useState<SitterDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchSitterDetail();
    fetchReviews();
  }, [params.id]);

  const checkUser = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchSitterDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('sitters')
        .select(
          `
          *,
          users (
            id,
            full_name,
            avatar_url,
            email
          )
        `
        )
        .eq('id', params.id)
        .eq('is_approved', true)
        .single();

      if (error) throw error;
      setSitter(data);
    } catch (error) {
      console.error('獲取保姆詳細資料失敗:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          `
          *,
          users (
            full_name
          )
        `
        )
        .eq('sitter_id', params.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('獲取評價失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill='currentColor'
        viewBox='0 0 20 20'
      >
        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-lg'>載入中...</div>
      </div>
    );
  }

  if (!sitter) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>找不到此保姆</h2>
          <Link href='/sitters' className='text-blue-600 hover:text-blue-800'>
            返回保姆列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        {/* 返回按鈕 */}
        <div className='mb-6'>
          <button onClick={() => router.back()} className='flex items-center text-gray-600 hover:text-gray-800'>
            <svg className='w-4 h-4 mr-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            返回
          </button>
        </div>

        {/* 保姆基本資訊 */}
        <div className='bg-white rounded-lg shadow-md p-8 mb-8'>
          <div className='flex flex-col md:flex-row items-start md:items-center gap-6'>
            {/* 頭像 */}
            <div className='w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0'>
              {sitter.users?.avatar_url ? (
                <img
                  src={sitter.users.avatar_url}
                  alt={sitter.users?.full_name || '保姆'}
                  className='w-full h-full rounded-full object-cover'
                />
              ) : (
                <svg className='w-16 h-16 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
              )}
            </div>

            {/* 基本資訊 */}
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-4'>
                <h1 className='text-3xl font-bold text-gray-900'>{sitter.users?.full_name || '匿名保姆'}</h1>
                {sitter.is_certified && (
                  <div className='flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full'>
                    <svg className='w-5 h-5 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='font-medium'>已認證</span>
                  </div>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                <div className='flex items-center text-gray-600'>
                  <svg className='w-5 h-5 mr-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
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
                <div className='flex items-center text-gray-600'>
                  <svg className='w-5 h-5 mr-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                    />
                  </svg>
                  <span className='font-semibold text-blue-600 text-lg'>NT$ {sitter.price_per_hour}/小時</span>
                </div>
              </div>

              {/* 評分 */}
              {reviews.length > 0 && (
                <div className='flex items-center gap-2 mb-4'>
                  <div className='flex items-center'>
                    {renderStars(Math.round(parseFloat(calculateAverageRating())))}
                  </div>
                  <span className='text-lg font-semibold text-gray-900'>{calculateAverageRating()}</span>
                  <span className='text-gray-500'>({reviews.length} 則評價)</span>
                </div>
              )}

              {/* 預約按鈕 */}
              {user && user.id !== sitter.users?.id && (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
                >
                  立即預約
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 詳細介紹 */}
        <div className='bg-white rounded-lg shadow-md p-8 mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>關於我</h2>
          <p className='text-gray-700 leading-relaxed whitespace-pre-line'>{sitter.introduction}</p>
        </div>

        {/* 專業資格 */}
        {sitter.qualifications && (
          <div className='bg-white rounded-lg shadow-md p-8 mb-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>專業資格</h2>
            <p className='text-gray-700 leading-relaxed whitespace-pre-line'>{sitter.qualifications}</p>
          </div>
        )}

        {/* 評價區塊 */}
        <div className='bg-white rounded-lg shadow-md p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>客戶評價</h2>

          {reviews.length === 0 ? (
            <div className='text-center py-8'>
              <div className='text-gray-400 mb-4'>
                <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.544-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z'
                  />
                </svg>
              </div>
              <p className='text-gray-500'>目前還沒有評價</p>
            </div>
          ) : (
            <div className='space-y-6'>
              {reviews.map(review => (
                <div key={review.id} className='border-b border-gray-200 pb-6 last:border-b-0'>
                  <div className='flex items-start justify-between mb-3'>
                    <div>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='font-medium text-gray-900'>{review.users?.full_name || '匿名用戶'}</span>
                        <div className='flex items-center'>{renderStars(review.rating)}</div>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {new Date(review.created_at).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  </div>
                  <p className='text-gray-700 leading-relaxed'>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 簡單的預約表單模態框 */}
        {showBookingForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-8 max-w-md w-full mx-4'>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>預約 {sitter.users?.full_name}</h3>
              <p className='text-gray-600 mb-6'>請透過以下方式聯繫保姆進行預約：</p>
              <div className='space-y-4'>
                <div className='p-4 bg-gray-50 rounded-lg'>
                  <p className='text-sm text-gray-600 mb-1'>電子郵件</p>
                  <p className='font-medium'>{sitter.users?.email}</p>
                </div>
                <div className='p-4 bg-blue-50 rounded-lg'>
                  <p className='text-sm text-blue-600 mb-1'>收費標準</p>
                  <p className='font-medium text-blue-800'>NT$ {sitter.price_per_hour}/小時</p>
                </div>
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
                >
                  關閉
                </button>
                <a
                  href={`mailto:${sitter.users?.email}?subject=預約寵物保姆服務&body=您好，我想預約您的寵物保姆服務，請問是否有空檔？`}
                  className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center'
                >
                  發送郵件
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
