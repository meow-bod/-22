// 表單驗證工具函數
// 提供統一的驗證邏輯，確保資料品質和使用者體驗

import { PetFormData, SitterFormData } from '@/types';

// 基礎驗證函數
export const validators = {
  // 電子郵件驗證
  email: (email: string): string | null => {
    if (!email) return '請輸入電子郵件';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return '請輸入有效的電子郵件格式';
    return null;
  },

  // 密碼驗證
  password: (password: string): string | null => {
    if (!password) return '請輸入密碼';
    if (password.length < 6) return '密碼至少需要 6 個字元';
    return null;
  },

  // 必填欄位驗證
  required: (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') return `請輸入${fieldName}`;
    return null;
  },

  // 數字驗證
  number: (value: number | null, fieldName: string, min?: number, max?: number): string | null => {
    if (value === null || value === undefined) return `請輸入${fieldName}`;
    if (isNaN(value)) return `${fieldName}必須是數字`;
    if (min !== undefined && value < min) return `${fieldName}不能小於 ${min}`;
    if (max !== undefined && value > max) return `${fieldName}不能大於 ${max}`;
    return null;
  },

  // 字串長度驗證
  length: (value: string, fieldName: string, min?: number, max?: number): string | null => {
    if (min !== undefined && value.length < min) {
      return `${fieldName}至少需要 ${min} 個字元`;
    }
    if (max !== undefined && value.length > max) {
      return `${fieldName}不能超過 ${max} 個字元`;
    }
    return null;
  },

  // 手機號碼驗證（台灣格式）
  phone: (phone: string): string | null => {
    if (!phone) return '請輸入手機號碼';
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(phone)) return '請輸入有效的手機號碼格式（09xxxxxxxx）';
    return null;
  },

  // 價格驗證
  price: (price: number | null): string | null => {
    if (price === null || price === undefined) return '請輸入價格';
    if (isNaN(price)) return '價格必須是數字';
    if (price < 0) return '價格不能為負數';
    if (price > 10000) return '價格不能超過 10,000 元';
    return null;
  }
};

// 寵物表單驗證
export function validatePetForm(data: PetFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  // 驗證寵物名稱
  const nameError = validators.required(data.name, '寵物名稱') || validators.length(data.name, '寵物名稱', 1, 50);
  if (nameError) errors.name = nameError;

  // 驗證寵物類型
  const typeError = validators.required(data.pet_type, '寵物類型');
  if (typeError) errors.pet_type = typeError;

  // 驗證品種（可選）
  if (data.breed) {
    const breedError = validators.length(data.breed, '品種', 1, 50);
    if (breedError) errors.breed = breedError;
  }

  // 驗證年齡（可選）
  if (data.age !== null) {
    const ageError = validators.number(data.age, '年齡', 0, 30);
    if (ageError) errors.age = ageError;
  }

  // 驗證備註（可選）
  if (data.notes) {
    const notesError = validators.length(data.notes, '備註', 0, 500);
    if (notesError) errors.notes = notesError;
  }

  return errors;
}

// 保姆申請表單驗證
export function validateSitterForm(data: SitterFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  // 驗證服務地區
  const areaError =
    validators.required(data.service_area, '服務地區') || validators.length(data.service_area, '服務地區', 2, 100);
  if (areaError) errors.service_area = areaError;

  // 驗證自我介紹
  const introError =
    validators.required(data.introduction, '自我介紹') || validators.length(data.introduction, '自我介紹', 10, 1000);
  if (introError) errors.introduction = introError;

  // 驗證價格
  const priceError = validators.price(data.price_per_hour);
  if (priceError) errors.price_per_hour = priceError;

  // 驗證專業資格（可選）
  if (data.qualifications) {
    const qualError = validators.length(data.qualifications, '專業資格', 0, 500);
    if (qualError) errors.qualifications = qualError;
  }

  return errors;
}

// 登入表單驗證
export function validateLoginForm(email: string, password: string): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailError = validators.email(email);
  if (emailError) errors.email = emailError;

  const passwordError = validators.password(password);
  if (passwordError) errors.password = passwordError;

  return errors;
}

// 註冊表單驗證
export function validateSignupForm(
  email: string,
  password: string,
  confirmPassword: string,
  fullName: string
): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailError = validators.email(email);
  if (emailError) errors.email = emailError;

  const passwordError = validators.password(password);
  if (passwordError) errors.password = passwordError;

  if (password !== confirmPassword) {
    errors.confirmPassword = '密碼確認不一致';
  }

  const nameError = validators.required(fullName, '姓名') || validators.length(fullName, '姓名', 2, 50);
  if (nameError) errors.fullName = nameError;

  return errors;
}

// 個人資料表單驗證
export function validateProfileForm(fullName: string): Record<string, string> {
  const errors: Record<string, string> = {};

  const nameError = validators.required(fullName, '姓名') || validators.length(fullName, '姓名', 2, 50);
  if (nameError) errors.fullName = nameError;

  return errors;
}

// 檢查是否有驗證錯誤
export function hasValidationErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}

// 取得第一個錯誤訊息
export function getFirstError(errors: Record<string, string>): string | null {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
}

// 清理表單資料（移除前後空白）
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized = { ...data };

  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim();
    }
  });

  return sanitized;
}
