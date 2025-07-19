// 統一的型別定義檔案
// 這個檔案集中管理所有應用程式中使用的 TypeScript 介面和型別

import { User } from '@supabase/supabase-js';

// 基礎使用者介面
export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// 寵物相關型別
export interface Pet {
  id: string;
  user_id: string;
  name: string;
  pet_type: string;
  breed?: string;
  age?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PetFormData {
  name: string;
  pet_type: string;
  breed: string;
  age: number | null;
  notes: string;
}

// 保姆相關型別
export interface Sitter {
  id: string;
  full_name: string;
  avatar_url: string;
  service_area: string;
  introduction: string;
  price_per_hour: number;
  is_certified?: boolean;
}

export interface SitterFormData {
  service_area: string;
  introduction: string;
  price_per_hour: number;
  qualifications: string;
  experience: string;
  availability: string;
  emergency_contact: string;
  has_insurance: boolean;
  has_first_aid: boolean;
}

// 評價相關型別
export interface Review {
  id: string;
  booking_id: string;
  sitter_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  users?: AppUser;
}

// 預約相關型別
export interface Booking {
  id: string;
  user_id: string;
  sitter_id: string;
  pet_id: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  total_price: number;
  status: BookingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  users?: AppUser;
  sitters?: Sitter;
  pets?: Pet;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 服務更新相關型別
export interface ServiceUpdate {
  id: string;
  booking_id: string;
  sitter_id: string;
  message: string;
  image_url?: string;
  created_at: string;
  sitters?: Sitter;
}

// API 回應型別
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// 表單狀態型別
export interface FormState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

// 搜尋篩選型別
export interface SitterFilters {
  searchArea: string;
  priceRange: {
    min: number;
    max: number;
  };
  rating?: number;
}

// 分頁型別
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 通用載入狀態型別
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// 認證狀態型別
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// 檔案上傳型別
export interface FileUpload {
  file: File;
  preview?: string;
  uploading: boolean;
  error?: string;
}

// 通知型別
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// 地圖位置型別
export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

// 統計資料型別
export interface DashboardStats {
  totalBookings: number;
  totalEarnings: number;
  averageRating: number;
  completedServices: number;
}

// 使用者個人資料
export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  service_area?: string;
  introduction?: string;
  price_per_hour?: number;
  qualifications?: string;
  user_type: 'owner' | 'sitter';
}

// 表單驗證錯誤型別
export interface ValidationErrors {
  [key: string]: string;
}

// 匯出所有型別
export type { User as SupabaseUser };
