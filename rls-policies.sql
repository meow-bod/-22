-- 啟用 RLS (Row Level Security) 並建立安全策略

-- 1. 啟用所有資料表的 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_certifications ENABLE ROW LEVEL SECURITY;

-- 2. users 表格的 RLS 策略
-- 使用者只能查看和更新自己的資料
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. sitters 表格的 RLS 策略
-- 所有人都可以查看已審核的保姆資料，但只有保姆本人可以更新
CREATE POLICY "Anyone can view approved sitters" ON public.sitters
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Sitters can view own profile" ON public.sitters
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Sitters can update own profile" ON public.sitters
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert sitter profile" ON public.sitters
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. pets 表格的 RLS 策略
-- 使用者只能管理自己的寵物，保姆可以查看預約相關的寵物
CREATE POLICY "Users can manage own pets" ON public.pets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Sitters can view booked pets" ON public.pets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE bookings.pet_id = pets.id 
            AND bookings.sitter_id = auth.uid()
        )
    );

-- 5. bookings 表格的 RLS 策略
-- 使用者和保姆只能查看與自己相關的預約
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = sitter_id);

CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and sitters can update relevant bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = sitter_id);

-- 6. reviews 表格的 RLS 策略
-- 所有人都可以查看評價，但只有預約的使用者可以新增評價
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for own bookings" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE bookings.id = reviews.booking_id 
            AND bookings.user_id = auth.uid()
            AND bookings.status = 'completed'
        )
    );

-- 7. service_updates 表格的 RLS 策略
-- 相關的使用者和保姆可以查看和新增服務更新
CREATE POLICY "Related users can view service updates" ON public.service_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE bookings.id = service_updates.booking_id 
            AND (bookings.user_id = auth.uid() OR bookings.sitter_id = auth.uid())
        )
    );

CREATE POLICY "Related users can create service updates" ON public.service_updates
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE bookings.id = service_updates.booking_id 
            AND (bookings.user_id = auth.uid() OR bookings.sitter_id = auth.uid())
        )
    );

-- 8. 建立觸發器函數，自動更新 updated_at 欄位
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. sitter_certifications 表格的 RLS 策略
-- 所有人都可以查看保姆的認證資訊
CREATE POLICY "Anyone can view sitter certifications" ON public.sitter_certifications
    FOR SELECT USING (true);

-- 9. 為需要的資料表新增觸發器
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_sitters_updated_at
    BEFORE UPDATE ON public.sitters
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();