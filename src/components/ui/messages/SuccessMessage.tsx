'use client';

import React from 'react';

// SuccessMessage: 用於顯示成功訊息
const SuccessMessage = ({ message }: { message: string | null }) => {
  if (!message) return null;
  return <p className='mt-2 text-sm text-center text-green-600'>{message}</p>;
};

export default SuccessMessage;