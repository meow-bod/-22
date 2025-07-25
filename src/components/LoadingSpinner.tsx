// 載入動畫元件
// 提供統一的載入狀態顯示，可重複使用於整個應用程式

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
  text?: string;
  className?: string;
  showText?: boolean;
}

export function LoadingSpinner({ size = 'md', color = 'blue', text, className = '', showText = true }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  return (
    <div role="status" aria-label={text || '載入中...'} className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
      >
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        ></path>
      </svg>
      {showText && text && <p className={`mt-2 text-sm ${colorClasses[color]}`}>{text}</p>}
    </div>
  );
}

// 全頁面載入元件
export function FullPageLoading({ text = '載入中...' }: { text?: string }) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <LoadingSpinner size='lg' text={text} />
    </div>
  );
}

// 按鈕載入元件
export function ButtonLoading({ text = '處理中...' }: { text?: string }) {
  return (
    <div className='flex items-center justify-center'>
      <LoadingSpinner size='sm' color='white' className='mr-2' />
      <span>{text}</span>
    </div>
  );
}
