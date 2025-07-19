'use client';

import { useState, useCallback } from 'react';

const passwordCriteria = {
  minLength: { regex: /.{8,}/, message: '密碼長度至少需要 8 個字元' },
  lowercase: { regex: /[a-z]/, message: '密碼必須包含至少一個小寫字母' },
  uppercase: { regex: /[A-Z]/, message: '密碼必須包含至少一個大寫字母' },
  number: { regex: /[0-9]/, message: '密碼必須包含至少一個數字' },
  specialChar: { regex: /[^a-zA-Z0-9]/, message: '密碼必須包含至少一個特殊字元' },
};

type CriteriaKey = keyof typeof passwordCriteria;

export function usePasswordValidation() {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [criteriaMet, setCriteriaMet] = useState<Record<CriteriaKey, boolean>>({
    minLength: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const validatePassword = useCallback((password: string) => {
    let isValid = true;
    let firstErrorMessage = '';
    const newCriteriaMet: Record<CriteriaKey, boolean> = { ...criteriaMet };

    for (const key in passwordCriteria) {
      const criterion = passwordCriteria[key as CriteriaKey];
      const met = criterion.regex.test(password);
      newCriteriaMet[key as CriteriaKey] = met;
      if (!met && !firstErrorMessage) {
        firstErrorMessage = criterion.message;
        isValid = false;
      }
    }

    setPasswordError(isValid ? null : firstErrorMessage);
    setCriteriaMet(newCriteriaMet);
    return isValid;
  }, [criteriaMet, setCriteriaMet, setPasswordError]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  return {
    password,
    passwordError,
    criteriaMet,
    passwordCriteria,
    handlePasswordChange,
    validatePassword,
    setPassword,
  };
}