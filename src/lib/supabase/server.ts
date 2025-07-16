import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  // 建立一個伺服器端的 Supabase client，並設定它使用 cookies。
  // 這是確保在伺服器元件和路由處理器中能夠維持使用者驗證狀態的關鍵。
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // 當在 Server Component 中呼叫 `set` 方法時，可能會發生錯誤。
            // 如果您有中介軟體 (middleware) 來刷新使用者 session，可以忽略此錯誤。
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // 當在 Server Component 中呼叫 `remove` 方法時，可能會發生錯誤。
            // 如果您有中介軟體 (middleware) 來刷新使用者 session，可以忽略此錯誤。
          }
        },
      },
    }
  );
}