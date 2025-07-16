'use client';

import { useState } from 'react';
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, { message: '密碼長度至少需要 8 個字元' })
  .regex(/[a-z]/, { message: '密碼必須包含至少一個小寫字母' })
  .regex(/[A-Z]/, { message: '密碼必須包含至少一個大寫字母' })
  .regex(/[0-9]/, { message: '密碼必須包含至少一個數字' })
  .regex(/[^a-zA-Z0-9]/, { message: '密碼必須包含至少一個特殊字元' });

export function usePasswordValidation() {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validatePassword = (password: string) => {
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      setPasswordError(result.error.errors[0].message);
      return false;
    } else {
      setPasswordError(null);
      return true;
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  return {
    password,
    passwordError,
    handlePasswordChange,
    validatePassword,
    setPassword
  };
}