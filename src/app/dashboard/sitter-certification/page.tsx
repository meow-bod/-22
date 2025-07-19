import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import Quiz from '../../../components/ui/Quiz';
import VideoPlayer from '../../../components/ui/VideoPlayer';

const quizQuestions = [
  {
    question: '當狗狗第一次見到你並搖尾巴時，代表什麼？',
    options: ['開心', '緊張', '想攻擊', '以上皆有可能'],
    answer: '以上皆有可能'
  },
  {
    question: '貓咪發出呼嚕聲，通常是什麼意思？',
    options: ['滿足和放鬆', '疼痛或不適', '肚子餓', '以上皆是'],
    answer: '以上皆是'
  },
  {
    question: '哪種常見的室內植物對貓有毒？',
    options: ['波士頓蕨', '吊蘭', '百合花', '非洲紫羅蘭'],
    answer: '百合花'
  }
];

export default async function SitterCertificationPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();

  if (profile?.role !== 'sitter') {
    return (
      <div className='flex flex-col items-center justify-center h-full text-center'>
        <h1 className='text-2xl font-bold mb-4'>存取被拒</h1>
        <p>此頁面僅供保姆存取。</p>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold mb-4'>保姆培訓與認證中心</h1>
      <p className='text-lg text-gray-600 mb-8'>
        歡迎來到保姆專業化認證中心！在這裡，您可以透過我們的線上課程與測驗，提升您的專業知識，並獲得平台專業認證，增加飼主對您的信賴感。
      </p>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='border rounded-lg p-4'>
          <h2 className='text-2xl font-bold mb-4'>課程一：寵物基本照護</h2>
          <VideoPlayer src='https://www.youtube.com/embed/dQw4w9WgXcQ' title='寵物基本照護教學' />
          <p className='mt-4'>學習如何正確地餵食、梳理和清潔您的寵物客戶。</p>
        </div>
        <div className='border rounded-lg p-4 bg-gray-100'>
          <h2 className='text-2xl font-bold mb-4'>課程二：常見寵物行為解析 (即將推出)</h2>
          <div className='aspect-w-16 aspect-h-9 bg-gray-300 flex items-center justify-center'>
            <p className='text-gray-500'>敬請期待</p>
          </div>
          <p className='mt-4'>了解貓狗的常見行為語言，更好地與牠們溝通。</p>
        </div>
      </div>

      <div className='mt-12'>
        <h2 className='text-2xl font-bold mb-4'>專業知識測驗</h2>
        <p className='mb-6'>完成以下測驗，證明您的專業知識！</p>
        <Quiz questions={quizQuestions} />
      </div>
    </div>
  );
}
