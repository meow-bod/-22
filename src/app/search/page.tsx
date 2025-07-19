import { cookies } from 'next/headers';

import SearchResultList from '@/components/SearchResultList';
import { createClient } from '@/lib/supabase/server';
import { Sitter } from '@/types'; // 確保 Sitter 型別與函式回傳的欄位一致

const SearchPage = async () => {
  const supabase = createClient();

  // 使用 .rpc() 呼叫我們在 Supabase 中建立的資料庫函式
  const { data: sitters, error } = await supabase.rpc('get_approved_sitters');

  // 完整的錯誤處理機制
  if (error) {
    console.error('Error fetching sitters:', error);
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-red-500">讀取保姆資料時發生錯誤，請稍後再試。</p>
        {/* 在開發模式下可以顯示詳細錯誤訊息 */}
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-gray-500 mt-2">{error.message}</p>
        )}
      </div>
    );
  }

  // 將 Sitter 型別斷言應用於獲取的資料
  const typedSitters = (sitters || []) as Sitter[];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-text-primary">尋找最適合您毛孩的保姆</h1>
      {/* 將成功獲取的保姆資料傳遞給客戶端元件 */}
      <SearchResultList sitters={typedSitters} />
    </div>
  );
};

export default SearchPage;