'use client';

import ErrorBoundary from '../components/ErrorBoundary';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 在生產環境中，這裡可以發送錯誤到監控服務
        console.error('Application Error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}