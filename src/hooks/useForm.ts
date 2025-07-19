import { useState, useCallback } from 'react';

// 表單欄位配置介面
interface FormFieldConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validator?: (value: unknown) => string | null;
  transform?: (value: unknown) => unknown;
}

// 表單配置介面
type FormConfig<T> = Partial<Record<keyof T, FormFieldConfig>>;

// 表單狀態介面
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// 表單動作介面
interface FormActions<T> {
  setValue: (field: keyof T, value: unknown) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: (values?: Partial<T>) => void;
  validate: (field?: keyof T) => boolean;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>;
}

// 自訂表單 Hook
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  config: FormConfig<T> = {},
  options: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    resetOnSubmit?: boolean;
  } = {}
): FormState<T> & FormActions<T> {
  const { validateOnChange = true, validateOnBlur = true, resetOnSubmit = false } = options;

  // 表單狀態
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // 驗證單個欄位
  const validateField = useCallback(
    (field: keyof T, value: unknown): string | null => {
      const fieldConfig = config[field];
      if (!fieldConfig) return null;

      // 必填驗證
      if (fieldConfig.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return '此欄位為必填';
      }

      // 如果值為空且非必填，跳過其他驗證
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return null;
      }

      // 最小長度驗證
      if (fieldConfig.minLength && typeof value === 'string' && value.length < fieldConfig.minLength) {
        return `最少需要 ${fieldConfig.minLength} 個字元`;
      }

      // 最大長度驗證
      if (fieldConfig.maxLength && typeof value === 'string' && value.length > fieldConfig.maxLength) {
        return `最多只能 ${fieldConfig.maxLength} 個字元`;
      }

      // 正則表達式驗證
      if (fieldConfig.pattern && typeof value === 'string' && !fieldConfig.pattern.test(value)) {
        return '格式不正確';
      }

      // 自訂驗證器
      if (fieldConfig.validator) {
        return fieldConfig.validator(value);
      }

      return null;
    },
    [config]
  );

  // 驗證所有欄位或指定欄位
  const validate = useCallback(
    (field?: keyof T): boolean => {
      if (field) {
        const error = validateField(field, values[field]);
        setErrorsState(prev => ({
          ...prev,
          [field]: error || undefined
        }));
        return !error;
      }

      const newErrors: Partial<Record<keyof T, string>> = {};
      let isValid = true;

      Object.keys(values).forEach(key => {
        const error = validateField(key as keyof T, values[key as keyof T]);
        if (error) {
          newErrors[key as keyof T] = error;
          isValid = false;
        }
      });

      setErrorsState(newErrors);
      return isValid;
    },
    [values, validateField]
  );

  // 設定單個欄位值
  const setValue = useCallback(
    (field: keyof T, value: unknown) => {
      const fieldConfig = config[field];
      const transformedValue = fieldConfig?.transform ? fieldConfig.transform(value) : value;

      setValuesState(prev => ({
        ...prev,
        [field]: transformedValue
      }));

      setIsDirty(true);

      if (validateOnChange) {
        setTimeout(() => validate(field), 0);
      }
    },
    [config, validateOnChange, validate]
  );

  // 設定多個欄位值
  const setValues = useCallback(
    (newValues: Partial<T>) => {
      setValuesState(prev => ({ ...prev, ...newValues }));
      setIsDirty(true);

      if (validateOnChange) {
        setTimeout(() => validate(), 0);
      }
    },
    [validateOnChange, validate]
  );

  // 設定單個欄位錯誤
  const setError = useCallback((field: keyof T, error: string) => {
    setErrorsState(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  // 設定多個欄位錯誤
  const setErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrorsState(prev => ({ ...prev, ...newErrors }));
  }, []);

  // 清除單個欄位錯誤
  const clearError = useCallback((field: keyof T) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // 清除所有錯誤
  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  // 設定欄位觸碰狀態
  const setTouched = useCallback(
    (field: keyof T, touchedValue = true) => {
      setTouchedState(prev => ({
        ...prev,
        [field]: touchedValue
      }));

      if (validateOnBlur && touchedValue) {
        setTimeout(() => validate(field), 0);
      }
    },
    [validateOnBlur, validate]
  );

  // 設定提交狀態
  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  // 重置表單
  const reset = useCallback(
    (newValues?: Partial<T>) => {
      const resetValues = newValues ? { ...initialValues, ...newValues } : initialValues;
      setValuesState(resetValues);
      setErrorsState({});
      setTouchedState({});
      setIsSubmitting(false);
      setIsDirty(false);
    },
    [initialValues]
  );

  // 處理表單提交
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) => {
      return async (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
        }

        setIsSubmitting(true);

        try {
          // 驗證所有欄位
          const isValid = validate();

          if (!isValid) {
            // 標記所有欄位為已觸碰，以顯示錯誤
            const allTouched: Partial<Record<keyof T, boolean>> = {};
            Object.keys(values).forEach(key => {
              allTouched[key as keyof T] = true;
            });
            setTouchedState(allTouched);
            return;
          }

          // 執行提交邏輯
          await onSubmit(values);

          // 如果設定了提交後重置，則重置表單
          if (resetOnSubmit) {
            reset();
          }
        } catch (error) {
          console.error('Form submission error:', error);
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [values, validate, reset, resetOnSubmit]
  );

  // 計算表單是否有效
  const isValid = Object.keys(errors).length === 0;

  return {
    // 狀態
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    // 動作
    setValue,
    setValues,
    setError,
    setErrors,
    clearError,
    clearErrors,
    setTouched,
    setSubmitting,
    reset,
    validate,
    handleSubmit
  };
}

// 表單欄位 Hook
export function useFormField<T>(form: FormState<T> & FormActions<T>, field: keyof T) {
  const value = form.values[field];
  const error = form.errors[field];
  const touched = form.touched[field];
  const hasError = touched && !!error;

  const onChange = useCallback(
    (value: unknown) => {
      form.setValue(field, value);
    },
    [form, field]
  );

  const onBlur = useCallback(() => {
    form.setTouched(field, true);
  }, [form, field]);

  return {
    value,
    error,
    touched,
    hasError,
    onChange,
    onBlur
  };
}

export default useForm;
