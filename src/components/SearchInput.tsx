import React, { useCallback, useState, useEffect } from 'react';

interface SearchInputProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

// 使用 React.memo 優化效能
const SearchInput = React.memo(
  ({ onSearch, placeholder = '搜尋寵物...', debounceMs = 300, className = '' }: SearchInputProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');

    // 使用 useCallback 優化搜尋函數，避免每次渲染都重新建立
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    }, []);

    const clearSearch = useCallback(() => {
      setSearchTerm('');
      setDebouncedTerm('');
      onSearch('');
    }, [onSearch]);

    // 實作防抖動搜尋
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedTerm(searchTerm);
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [searchTerm, debounceMs]);

    // 當防抖動的搜尋詞改變時觸發搜尋
    useEffect(() => {
      onSearch(debouncedTerm);
    }, [debouncedTerm, onSearch]);

    return (
      <div className={`relative ${className}`}>
        <div className='relative'>
          <input
            type='text'
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={placeholder}
            className='w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
          />

          {/* 搜尋圖示 */}
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>

          {/* 清除按鈕 */}
          {searchTerm && (
            <button
              onClick={clearSearch}
              className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors'
              type='button'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          )}
        </div>

        {/* 搜尋提示 */}
        {searchTerm && (
          <div className='absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm border'>
            正在搜尋「{searchTerm}」...
          </div>
        )}
      </div>
    );
  }
);

// 設定 displayName 以便於除錯
SearchInput.displayName = 'SearchInput';

export { SearchInput };
