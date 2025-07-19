import { useRouter } from 'next/navigation';

export const AlreadySitter = () => {
  const router = useRouter();

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
};