'use client';

import React from 'react';

// FormContainer: 包裹整個表單的容器，提供基本樣式
export const FormContainer = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className='flex items-center justify-center min-h-screen bg-background-subtle'>
    <div className='w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold text-center text-text-main'>{title}</h2>
      {children}
    </div>
  </div>
);

// FormGroup: 用於包裹 Label 和 Input 的群組
export const FormGroup = ({ children }: { children: React.ReactNode }) => (
  <div className='space-y-1'>{children}</div>
);

// Label: 表單欄位的標籤
export const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className='block text-sm font-medium text-text-subtle'>
    {children}
  </label>
);

// Input: 表單的輸入框
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={`block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${className}`}
    {...props}
  />
));
Input.displayName = 'Input';

// Button: 表單的提交按鈕
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export const Button = ({ children, className, ...props }: ButtonProps) => (
  <button
    className={`flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${className}`}
    {...props}
  >
    {children}
  </button>
);

// ErrorMessage: 用於顯示錯誤訊息
export const ErrorMessage = ({ message }: { message: string | null }) => {
  if (!message) return null;
  return <p className='mt-2 text-sm text-center text-red-600'>{message}</p>;
};

// SuccessMessage: 用於顯示成功訊息
export const SuccessMessage = ({ message }: { message: string | null }) => {
  if (!message) return null;
  return <p className='mt-2 text-sm text-center text-green-600'>{message}</p>;
};