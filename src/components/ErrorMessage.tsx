// 錯誤訊息顯示元件
// 提供統一的錯誤狀態顯示，包含不同類型的錯誤樣式

import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({
  title,
  message,
  type = 'error',
  onRetry,
  onDismiss,
  className = ''
}: ErrorMessageProps) {
  const typeStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      message: 'text-red-700',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      message: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const styles = typeStyles[type];

  const getIcon = () => {
    switch (type) {
      case 'error':
        return (
          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'info':
        return (
          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
              clipRule='evenodd'
            />
          </svg>
        );
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${styles.container} ${className}`}>
      <div className='flex items-start'>
        <div className={`flex-shrink-0 ${styles.icon}`}>{getIcon()}</div>
        <div className='ml-3 flex-1'>
          {title && <h3 className={`text-sm font-medium ${styles.title} mb-1`}>{title}</h3>}
          <p className={`text-sm ${styles.message}`}>{message}</p>
          {(onRetry || onDismiss) && (
            <div className='mt-4 flex space-x-3'>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`text-sm font-medium text-white px-3 py-1 rounded-md ${styles.button} transition-colors`}
                >
                  重試
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className='text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors'
                >
                  關閉
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 簡化的錯誤訊息元件
export function SimpleError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className='text-center py-8'>
      <div className='text-red-500 mb-4'>
        <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      </div>
      <h3 className='text-lg font-medium text-gray-900 mb-2'>發生錯誤</h3>
      <p className='text-gray-500 mb-4'>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          重新載入
        </button>
      )}
    </div>
  );
}

// 空狀態元件
export function EmptyState({
  title,
  message,
  actionText,
  onAction
}: {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className='text-center py-12'>
      <div className='text-gray-400 mb-4'>
        <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
          />
        </svg>
      </div>
      <h3 className='text-lg font-medium text-gray-900 mb-2'>{title}</h3>
      <p className='text-gray-500 mb-6'>{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
