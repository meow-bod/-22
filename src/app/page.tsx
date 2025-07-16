'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { SuccessMessage } from '@/components/SuccessMessage';

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<string>('檢測中...');
  const [user, setUser] = useState<User | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
          setConnectionStatus(`連線失敗: ${error.message}`);
        } else {
          setConnectionStatus('✅ Supabase 連線成功！');
        }
      } catch (err) {
        setConnectionStatus(`連線錯誤: ${err}`);
      }
    };

    const getUser = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    // 檢查成功訊息
    const success = searchParams.get('success');
    if (success === 'sitter-application') {
      setShowSuccessMessage('申請提交成功！我們會在 3-5 個工作天內審核您的申請。');
    }

    testConnection();
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <main className='max-w-4xl mx-auto text-center'>
        {/* 成功訊息 */}
        {showSuccessMessage && (
          <SuccessMessage
            message={showSuccessMessage}
            onClose={() => setShowSuccessMessage(null)}
            autoClose
            className='mb-6'
          />
        )}

        {/* 主標題 */}
        <div className='flex justify-between items-center mb-8 w-full'>
          <div>
            <h1 className='text-6xl font-bold text-gray-800 mb-4'>
              🐾 <span className='text-blue-600'>Pawdner</span>
            </h1>
            <p className='text-xl text-gray-600'>專業寵物照顧媒合平台</p>
          </div>
          <div>
            {user ? (
              <div className='flex items-center space-x-4'>
                <span className='text-gray-600'>你好, {user.email}</span>
                <Link
                  href='/profile'
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  個人資料
                </Link>
                <Link
                  href='/pets'
                  className='px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                >
                  我的寵物
                </Link>
                <Link
                  href='/sitters'
                  className='px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                >
                  尋找保姆
                </Link>
                <button
                  onClick={handleLogout}
                  className='px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  登出
                </button>
              </div>
            ) : (
              <div className='flex items-center space-x-4'>
                <Link
                  href='/auth/login'
                  className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  登入
                </Link>
                <Link
                  href='/auth/signup'
                  className='px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  註冊
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 功能介紹卡片 */}
        <div className='grid md:grid-cols-3 gap-6 mb-12'>
          <div className='bg-white rounded-lg p-6 shadow-lg'>
            <div className='text-3xl mb-4'>🏠</div>
            <h3 className='text-lg font-semibold mb-2'>到府照顧</h3>
            <p className='text-gray-600'>專業保姆到您家中照顧愛寵</p>
          </div>
          <div className='bg-white rounded-lg p-6 shadow-lg'>
            <div className='text-3xl mb-4'>🚶</div>
            <h3 className='text-lg font-semibold mb-2'>寵物遛遛</h3>
            <p className='text-gray-600'>讓您的毛孩享受戶外運動時光</p>
          </div>
          <div className='bg-white rounded-lg p-6 shadow-lg'>
            <div className='text-3xl mb-4'>📱</div>
            <h3 className='text-lg font-semibold mb-2'>即時回報</h3>
            <p className='text-gray-600'>隨時掌握愛寵的照顧狀況</p>
          </div>
        </div>

        {/* 成為保姆 CTA */}
        {user && (
          <div className='bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 mb-12 text-white text-center'>
            <h3 className='text-2xl font-bold mb-4'>想成為專業寵物保姆嗎？</h3>
            <p className='mb-6'>加入 Pawdner，開始您的寵物照顧事業！</p>
            <Link
              href='/sitter-application'
              className='inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors'
            >
              立即申請
            </Link>
          </div>
        )}

        {/* 連線狀態 */}
        <div className='bg-white rounded-lg p-6 shadow-lg mb-8'>
          <h3 className='text-lg font-semibold mb-4'>系統狀態</h3>
          <p className={`text-sm ${connectionStatus.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
            {connectionStatus}
          </p>
        </div>

        {/* 開發進度 */}
        <div className='bg-white rounded-lg p-6 shadow-lg'>
          <h3 className='text-lg font-semibold mb-4'>開發進度 - Phase 1</h3>
          <div className='space-y-2 text-left'>
            <div className='flex items-center'>
              <span className='text-green-500 mr-2'>✅</span>
              <span className='text-sm'>1.1 初始化 Next.js 專案</span>
            </div>
            <div className='flex items-center'>
              <span className='text-yellow-500 mr-2'>⏳</span>
              <span className='text-sm'>1.2 建立 Supabase 專案 (需手動完成)</span>
            </div>
            <div className='flex items-center'>
              <span className='text-green-500 mr-2'>✅</span>
              <span className='text-sm'>1.3 設定環境變數</span>
            </div>
            <div className='flex items-center'>
              <span className='text-green-500 mr-2'>✅</span>
              <span className='text-sm'>1.4 建立 Supabase Client</span>
            </div>
            <div className='flex items-center'>
              <span className='text-green-500 mr-2'>✅</span>
              <span className='text-sm'>1.5 設計資料庫 Schema</span>
            </div>
            <div className='flex items-center'>
              <span className='text-green-500 mr-2'>✅</span>
              <span className='text-sm'>1.6 設定 RLS 策略</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
