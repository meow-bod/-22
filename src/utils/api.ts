// API 工具函數
// 統一處理 Supabase 操作、錯誤處理和資料轉換

import { createClient } from '@/lib/supabase/client';
import { Pet, Sitter, Review, Booking, ApiResponse, PetFormData, SitterFormData } from '@/types';

const supabase = createClient();

// 通用錯誤處理函數
function handleError(error: any): ApiResponse<null> {
  console.error('API Error:', error);
  return {
    data: null,
    error: error.message || '發生未知錯誤',
    success: false
  };
}

// 通用成功回應
function handleSuccess<T>(data: T): ApiResponse<T> {
  return {
    data,
    error: null,
    success: true
  };
}

// 認證相關 API
export const authApi = {
  // 取得當前使用者
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();
      if (error) throw error;
      return handleSuccess(user);
    } catch (error) {
      return handleError(error);
    }
  },

  // 登出
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return handleSuccess(null);
    } catch (error) {
      return handleError(error);
    }
  }
};

// 寵物相關 API
export const petApi = {
  // 取得使用者的所有寵物
  async getUserPets(userId: string): Promise<ApiResponse<Pet[]>> {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  },

  // 新增寵物
  async createPet(userId: string, petData: PetFormData): Promise<ApiResponse<Pet>> {
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert({
          user_id: userId,
          ...petData
        })
        .select()
        .single();

      if (error) throw error;
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // 更新寵物
  async updatePet(petId: string, petData: Partial<PetFormData>): Promise<ApiResponse<Pet>> {
    try {
      const { data, error } = await supabase.from('pets').update(petData).eq('id', petId).select().single();

      if (error) throw error;
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // 刪除寵物
  async deletePet(petId: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.from('pets').delete().eq('id', petId);

      if (error) throw error;
      return handleSuccess(null);
    } catch (error) {
      return handleError(error);
    }
  }
};

// 保姆相關 API
export const sitterApi = {
  // 取得所有已審核的保姆
  async getApprovedSitters(): Promise<ApiResponse<Sitter[]>> {
    try {
      const { data, error } = await supabase
        .from('sitters')
        .select(
          `
          *,
          users (
            full_name,
            avatar_url
          )
        `
        )
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  },

  // 取得單一保姆詳細資料
  async getSitterById(sitterId: string): Promise<ApiResponse<Sitter>> {
    try {
      const { data, error } = await supabase
        .from('sitters')
        .select(
          `
          *,
          users (
            id,
            full_name,
            avatar_url,
            email
          )
        `
        )
        .eq('id', sitterId)
        .eq('is_approved', true)
        .single();

      if (error) throw error;
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // 申請成為保姆
  async applySitter(userId: string, sitterData: SitterFormData): Promise<ApiResponse<Sitter>> {
    try {
      const { data, error } = await supabase
        .from('sitters')
        .insert({
          user_id: userId,
          ...sitterData,
          is_approved: false // 預設為未審核
        })
        .select()
        .single();

      if (error) throw error;
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // 檢查使用者是否已是保姆
  async checkUserSitterStatus(userId: string): Promise<ApiResponse<Sitter | null>> {
    try {
      const { data, error } = await supabase.from('sitters').select('*').eq('user_id', userId).single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 是找不到資料的錯誤碼
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  }
};

// 評價相關 API
export const reviewApi = {
  // 取得保姆的評價
  async getSitterReviews(sitterId: string): Promise<ApiResponse<Review[]>> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          `
          *,
          users (
            full_name
          )
        `
        )
        .eq('sitter_id', sitterId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  }
};

// 使用者相關 API
export const userApi = {
  // 更新使用者個人資料
  async updateProfile(userId: string, profileData: { full_name: string }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.from('users').update(profileData).eq('id', userId).select().single();

      if (error) throw error;
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // 取得使用者個人資料
  async getProfile(userId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

      if (error) throw error;
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  }
};

// 檔案上傳 API
export const uploadApi = {
  // 上傳頭像
  async uploadAvatar(userId: string, file: File): Promise<ApiResponse<string>> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      return handleSuccess(data.publicUrl);
    } catch (error) {
      return handleError(error);
    }
  }
};

// 統計資料 API
export const statsApi = {
  // 取得保姆統計資料
  async getSitterStats(sitterId: string) {
    try {
      // 這裡可以實作更複雜的統計查詢
      // 目前先返回基本資料
      const reviewsResponse = await reviewApi.getSitterReviews(sitterId);

      if (!reviewsResponse.success || !reviewsResponse.data) {
        throw new Error('無法取得評價資料');
      }

      const reviews = reviewsResponse.data;
      const averageRating =
        reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

      return handleSuccess({
        totalReviews: reviews.length,
        averageRating: Number(averageRating.toFixed(1)),
        recentReviews: reviews.slice(0, 3)
      });
    } catch (error) {
      return handleError(error);
    }
  }
};
