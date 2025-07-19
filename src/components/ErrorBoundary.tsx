'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

import { ErrorMessage } from './ErrorMessage';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// 錯誤邊界元件
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 以顯示錯誤 UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 記錄錯誤資訊
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // 呼叫自訂錯誤處理函數
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 在生產環境中，可以將錯誤發送到錯誤追蹤服務
    if (process.env.NODE_ENV === 'production') {
      // 例如：發送到 Sentry、LogRocket 等服務
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // 這裡可以整合錯誤追蹤服務
    // 例如：Sentry.captureException(error, { extra: errorInfo });
    // 在這個範例中，我們只在開發環境中打印日誌
    if (process.env.NODE_ENV === 'development') {
      // 使用 console.error 來表示這是一個錯誤日誌
      console.error('Logging error to service:', { error, errorInfo });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 如果有自訂的 fallback UI，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 預設的錯誤 UI
      return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
          <div className='max-w-md w-full'>
            <ErrorMessage
              type='error'
              title='應用程式發生錯誤'
              message={this.state.error?.message || '發生未知錯誤'}
              onRetry={this.handleRetry}
              className='mb-4'
            />

            <div className='bg-white rounded-lg shadow-md p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>錯誤詳情</h3>

              <div className='space-y-4'>
                <div>
                  <h4 className='text-sm font-medium text-gray-700 mb-2'>錯誤訊息：</h4>
                  <p className='text-sm text-gray-600 bg-gray-50 p-3 rounded font-mono'>{this.state.error?.message}</p>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                  <div>
                    <h4 className='text-sm font-medium text-gray-700 mb-2'>堆疊追蹤：</h4>
                    <pre className='text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-h-40'>
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}

                {process.env.NODE_ENV === 'development' && this.state.errorInfo?.componentStack && (
                  <div>
                    <h4 className='text-sm font-medium text-gray-700 mb-2'>元件堆疊：</h4>
                    <pre className='text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-h-40'>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>

              <div className='flex space-x-4 mt-6'>
                <button
                  onClick={this.handleRetry}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  重試
                </button>
                <button
                  onClick={this.handleReload}
                  className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
                >
                  重新載入頁面
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 函數式元件版本的錯誤邊界 Hook（實驗性）
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
    console.error('Error captured:', error);
  }, []);

  React.useEffect(() => {
    if (error) {
      // 可以在這裡添加錯誤報告邏輯
    }
  }, [error]);

  return { error, resetError, captureError };
};

// 高階元件版本
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithErrorBoundaryComponent;
};

export default ErrorBoundary;
