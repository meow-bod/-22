-- 建立一個自訂型別，用來定義回傳資料的結構，讓格式更清晰
-- 如果這個型別已經存在，我們先刪除它再重建，確保定義是最新的
DROP TYPE IF EXISTS public.approved_sitter_details CASCADE;
CREATE TYPE public.approved_sitter_details AS (
    id UUID,
    full_name TEXT,
    avatar_url TEXT,
    service_area TEXT, -- 對應您提到的 city
    introduction TEXT,   -- 對應您提到的 bio
    price_per_hour NUMERIC,
    is_certified BOOLEAN -- 新增認證狀態欄位
);

-- 建立或取代函式
CREATE OR REPLACE FUNCTION public.get_approved_sitters()
RETURNS SETOF public.approved_sitter_details -- 指定回傳的資料是多筆 approved_sitter_details 型別的紀錄
LANGUAGE plpgsql
SECURITY DEFINER -- 使用定義者權限，可以安全地繞過 RLS 規則來讀取內部資料
AS $$
BEGIN
    -- 使用 RETURN QUERY 來執行一個查詢並將其結果回傳
    RETURN QUERY
    SELECT
        s.id,
        u.full_name,
        u.avatar_url,
        s.service_area,
        s.introduction,
        s.price_per_hour,
        s.is_certified -- 查詢認證狀態
    FROM
        public.sitters AS s
    -- 使用 JOIN 將 sitters 和 users 表格關聯起來，以獲取保姆的姓名和頭像
    JOIN
        public.users AS u ON s.id = u.id
    -- 篩選條件：只選擇已通過審核的保姆
    WHERE
        s.is_approved = TRUE;
END;
$$;