import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md'>
        <h2 className='text-2xl font-bold text-gray-900'>驗證錯誤</h2>
        <p className='text-gray-600'>抱歉，我們在驗證您的身份時遇到了問題。這可能是由於驗證連結已過期或無效。</p>
        <p className='text-gray-600'>請嘗試重新登入或註冊。</p>
        <div className='flex justify-center space-x-4'>
          <Link
            href='/auth/login'
            className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            前往登入
          </Link>
          <Link
            href='/auth/signup'
            className='px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            前往註冊
          </Link>
        </div>
      </div>
    </div>
  );
}
