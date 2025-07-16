-- 輔助函式：檢查使用者是否為管理員
-- 這個函式會從 JWT token 中讀取使用者的 app_metadata，並檢查 'roles' 陣列是否包含 'admin'。
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt()->>'raw_app_meta_data')::jsonb->'roles' @> '["admin"]'::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
-- sitters 資料表的 RLS 策略
-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

-- 啟用 sitters 表的 RLS
ALTER TABLE public.sitters ENABLE ROW LEVEL SECURITY;

-- 1. SELECT (讀取) 策略
DROP POLICY IF EXISTS "Allow public read access to approved sitters" ON public.sitters;
CREATE POLICY "Allow public read access to approved sitters"
  ON public.sitters FOR SELECT
  USING ( is_approved = TRUE );

DROP POLICY IF EXISTS "Allow admin to read all sitters" ON public.sitters;
CREATE POLICY "Allow admin to read all sitters"
  ON public.sitters FOR SELECT
  TO authenticated
  USING ( is_admin() );

DROP POLICY IF EXISTS "Allow users to read their own sitter profile" ON public.sitters;
CREATE POLICY "Allow users to read their own sitter profile"
  ON public.sitters FOR SELECT
  TO authenticated
  USING ( auth.uid() = id );

-- 2. UPDATE (更新) 策略
DROP POLICY IF EXISTS "Allow admin to update any sitter profile" ON public.sitters;
CREATE POLICY "Allow admin to update any sitter profile"
  ON public.sitters FOR UPDATE
  TO authenticated
  USING ( is_admin() );

DROP POLICY IF EXISTS "Allow users to update their own sitter profile" ON public.sitters;
CREATE POLICY "Allow users to update their own sitter profile"
  ON public.sitters FOR UPDATE
  TO authenticated
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );

-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
-- users 資料表的 RLS 策略 (確保使用者只能看到自己的資料)
-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

-- 啟用 users 表的 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view their own data" ON public.users;
CREATE POLICY "Allow users to view their own data"
  ON public.users FOR SELECT
  TO authenticated
  USING ( auth.uid() = id );

DROP POLICY IF EXISTS "Allow admin to view all users" ON public.users;
CREATE POLICY "Allow admin to view all users"
  ON public.users FOR SELECT
  TO authenticated
  USING ( is_admin() );

DROP POLICY IF EXISTS "Allow users to update their own data" ON public.users;
CREATE POLICY "Allow users to update their own data"
  ON public.users FOR UPDATE
  TO authenticated
  USING ( auth.uid() = id );