import React from 'react';

interface StatusIndicatorProps {
  loading: boolean;
  user: any; // Can be a user object or null
  data: any[]; // The data array to check for emptiness
  loadingMessage?: string;
  loginMessage?: string;
  emptyMessage?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  loading,
  user,
  data,
  loadingMessage = '讀取中...',
  loginMessage = '請先登入',
  emptyMessage = '目前沒有資料。',
}) => {
  if (loading) {
    return <div className="flex justify-center items-center h-64"><div>{loadingMessage}</div></div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-64"><div>{loginMessage}</div></div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-10"><p>{emptyMessage}</p></div>;
  }

  return null;
};

export default StatusIndicator;