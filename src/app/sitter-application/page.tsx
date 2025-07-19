'use client';

import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';
import { SitterFormData, ValidationErrors } from '@/types';
import { sitterApi as sitterAPI } from '@/utils/api';
import { validateSitterForm as validateSitterApplication, hasValidationErrors as hasErrors } from '@/utils/validation';

export default function SitterApplication() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSitter, setIsSitter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const router = useRouter();
  const supabase = createClient();

  // 表單狀態
  const [formData, setFormData] = useState<SitterFormData>({
    service_area: '',
    introduction: '',
    price_per_hour: 0,
    experience: '',
    availability: '',
    emergency_contact: '',
    has_insurance: false,
    has_first_aid: false
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);

      // 檢查是否已經是保姆
      const sitterData = await sitterAPI.getSitterById(user.id);
      if (sitterData) {
        setIsAlreadySitter(true);
      }
    } catch (error) {
      console.error('檢查使用者狀態失敗:', error);
      setError('載入頁面時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // 驗證表單
    const errors = validateSitterApplication(formData);
    setValidationErrors(errors);

    if (hasErrors(errors)) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      setSubmitting(true);
      setError(null);
      setValidationErrors({});

      // 驗證表單
      const errors = validateSitterApplication(formData);
      if (hasErrors(errors)) {
        setValidationErrors(errors);
        return;
      }

      await sitterAPI.createApplication(formData);

      // 重定向到首頁並顯示成功訊息
      router.push('/?success=sitter-application');
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交申請時發生錯誤');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size='large' text='載入申請頁面...' fullScreen />;
  }

  if (isAlreadySitter) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-2xl mx-auto px-4'>
          <div className='bg-white rounded-lg shadow-md p-8 text-center'>
            <div className='text-green-500 mb-4'>
              <svg className='mx-auto h-16 w-16' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>您已經是保姆了！</h2>
            <p className='text-gray-600 mb-6'>您已經提交過保姆申請，可以前往個人資料頁面管理您的保姆檔案。</p>
            <div className='space-x-4'>
              <button
                onClick={() => router.push('/')}
                className='px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400'
              >
                返回首頁
              </button>
              <button
                onClick={() => router.push('/profile')}
                className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
              >
                管理檔案
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-2xl mx-auto px-4'>
        {/* 頁面標題 */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>成為 Pawdner 保姆</h1>
          <p className='text-gray-600'>加入我們的專業保姆團隊，為毛孩們提供優質的照顧服務</p>
        </div>

        {/* 錯誤訊息 */}
        {error && <ErrorMessage message={error} onClose={() => setError(null)} className='mb-6' />}

        {/* 申請須知 */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8'>
          <h3 className='text-lg font-semibold text-blue-900 mb-3'>申請須知</h3>
          <ul className='text-sm text-blue-800 space-y-2'>
            <li>• 必須年滿 18 歲</li>
            <li>• 具備寵物照顧經驗</li>
            <li>• 通過身份驗證</li>
            <li>• 審核時間約 3-5 個工作天</li>
            <li>• 審核通過後即可開始接單</li>
          </ul>
        </div>

        {/* 申請表單 */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* 基本資訊 */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>基本資訊</h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>服務地區 *</label>
                  <input
                    type='text'
                    required
                    value={formData.service_area}
                    onChange={e => setFormData({ ...formData, service_area: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.service_area ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='例如：台北市大安區、新北市板橋區'
                  />
                  {validationErrors.service_area && (
                    <p className='mt-1 text-sm text-red-600'>{validationErrors.service_area}</p>
                  )}
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>每小時收費 (NT$) *</label>
                  <input
                    type='number'
                    required
                    min='100'
                    max='2000'
                    value={formData.price_per_hour}
                    onChange={e => setFormData({ ...formData, price_per_hour: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.price_per_hour ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='建議範圍：200-800'
                  />
                  {validationErrors.price_per_hour && (
                    <p className='mt-1 text-sm text-red-600'>{validationErrors.price_per_hour}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 自我介紹 */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>自我介紹</h3>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>請介紹您的背景和照顧寵物的經驗 *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.introduction}
                  onChange={e => setFormData({ ...formData, introduction: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.introduction ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='請詳細描述您的寵物照顧經驗、專長、個人特質等...'
                />
                {validationErrors.introduction && (
                  <p className='mt-1 text-sm text-red-600'>{validationErrors.introduction}</p>
                )}
              </div>
            </div>

            {/* 專業資格 */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>專業資格</h3>
              <div className='space-y-3'>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='insurance'
                    checked={formData.has_insurance}
                    onChange={e => setFormData({ ...formData, has_insurance: e.target.checked })}
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  />
                  <label htmlFor='insurance' className='ml-2 text-sm text-gray-700'>
                    我有寵物照顧相關保險
                  </label>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='first-aid'
                    checked={formData.has_first_aid}
                    onChange={e => setFormData({ ...formData, has_first_aid: e.target.checked })}
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  />
                  <label htmlFor='first-aid' className='ml-2 text-sm text-gray-700'>
                    我有寵物急救相關證照或訓練
                  </label>
                </div>
              </div>
            </div>

            {/* 提交按鈕 */}
            <div className='flex space-x-4'>
              <button
                type='submit'
                disabled={submitting}
                className='flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
              >
                {submitting && <LoadingSpinner size='small' className='mr-2' />}
                {submitting ? '提交中...' : '提交申請'}
              </button>
              <button
                type='button'
                onClick={() => router.push('/')}
                disabled={submitting}
                className='px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50'
              >
                取消
              </button>
            </div>
          </form>
        </div>

        {/* 注意事項 */}
        <div className='mt-8 text-center text-sm text-gray-500'>
          <p>提交申請後，我們會在 3-5 個工作天內進行審核。</p>
          <p>審核結果將透過 Email 通知您。</p>
        </div>
      </div>
    </div>
  );
}
