import { useState, useEffect, useCallback, useRef } from 'react';

// API 狀態介面
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

// API 選項介面
interface ApiOptions<T> {
  immediate?: boolean; // 是否立即執行
  cacheTime?: number; // 快取時間（毫秒）
  retryCount?: number; // 重試次數
  retryDelay?: number; // 重試延遲（毫秒）
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

// 快取管理
class ApiCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; cacheTime: number }>();

  set(key: string, data: T, cacheTime: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      cacheTime
    });
  }

  get(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.cacheTime;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const isExpired = Date.now() - cached.timestamp > cached.cacheTime;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

const apiCache = new ApiCache<unknown>();

// 通用 API Hook
export function useApi<T>(apiFunction: () => Promise<T>, dependencies: unknown[] = [], options: ApiOptions<T> = {}) {
  const {
    immediate = true,
    cacheTime = 5 * 60 * 1000, // 預設快取 5 分鐘
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cacheKey = useRef<string>('');

  // 生成快取鍵
  const generateCacheKey = useCallback(() => {
    return `${apiFunction.toString()}_${JSON.stringify(dependencies)}`;
  }, [apiFunction, dependencies]);

  // 執行 API 請求
  const execute = useCallback(
    async (forceRefresh = false) => {
      // 取消之前的請求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 清除重試計時器
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      const key = generateCacheKey();
      cacheKey.current = key;

      // 檢查快取
      if (!forceRefresh && apiCache.has(key)) {
        const cachedData = apiCache.get(key) as T;
        setState(prev => ({
          ...prev,
          data: cachedData,
          loading: false,
          error: null,
          lastFetch: new Date()
        }));
        return cachedData;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      const controller = new AbortController();
      abortControllerRef.current = controller;

      let attempt = 0;
      const maxAttempts = retryCount + 1;

      const attemptRequest = async (): Promise<T> => {
        try {
          attempt++;
          const result = await apiFunction();

          // 檢查請求是否被取消
          if (controller.signal.aborted) {
            throw new Error('Request aborted');
          }

          // 快取結果
          apiCache.set(key, result, cacheTime);

          setState({
            data: result,
            loading: false,
            error: null,
            lastFetch: new Date()
          });

          if (onSuccess) {
            onSuccess(result);
          }

          return result;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '請求失敗';
          // 如果請求被取消，不處理錯誤
          if (controller.signal.aborted || errorMessage === 'Request aborted') {
            return Promise.reject(error);
          }

          // 如果還有重試機會，進行重試
          if (attempt < maxAttempts) {
            return new Promise((resolve, reject) => {
              retryTimeoutRef.current = setTimeout(() => {
                attemptRequest().then(resolve).catch(reject);
              }, retryDelay * attempt); // 指數退避
            });
          }

          // 所有重試都失敗了
          setState({
            data: null,
            loading: false,
            error: errorMessage,
            lastFetch: new Date()
          });

          if (onError) {
            onError(errorMessage);
          }

          throw error;
        }
      };

      return attemptRequest();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [generateCacheKey, cacheTime, retryCount, retryDelay, onSuccess, onError]
  );

  // 重新整理數據
  const refresh = useCallback(() => {
    return execute(true);
  }, [execute]);

  // 清除快取
  const clearCache = useCallback(() => {
    apiCache.clear(cacheKey.current);
  }, []);

  // 重置狀態
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastFetch: null
    });
    clearCache();
  }, [clearCache]);

  // 自動執行
  useEffect(() => {
    if (immediate) {
      execute();
    }

    // 清理函數
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    ...state,
    execute,
    refresh,
    clearCache,
    reset,
    isStale: state.lastFetch ? Date.now() - state.lastFetch.getTime() > cacheTime : true
  };
}

// 突變 API Hook（用於 POST、PUT、DELETE 等操作）
export function useMutation<T, P>(
  mutationFunction: (params: P) => Promise<T>,
  options: {
    onSuccess?: (data: T, params: P) => void;
    onError?: (error: string, params: P) => void;
    onSettled?: (data: T | null, error: string | null, params: P) => void;
  } = {}
) {
  const { onSuccess, onError, onSettled } = options;

  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const mutate = useCallback(
    async (params: P) => {
      // 取消之前的請求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setState({ data: null, loading: true, error: null });

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const result = await mutationFunction(params);

        // 檢查請求是否被取消
        if (controller.signal.aborted) {
          throw new Error('Request aborted');
        }

        setState({
          data: result,
          loading: false,
          error: null
        });

        if (onSuccess) {
          onSuccess(result, params);
        }

        if (onSettled) {
          onSettled(result, null, params);
        }

        return result;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '操作失敗';
        // 如果請求被取消，不處理錯誤
        if (controller.signal.aborted || errorMessage === 'Request aborted') {
          return Promise.reject(error);
        }

        setState({
          data: null,
          loading: false,
          error: errorMessage
        });

        if (onError) {
          onError(errorMessage, params);
        }

        if (onSettled) {
          onSettled(null, errorMessage, params);
        }

        throw error;
      }
    },
    [mutationFunction, onSuccess, onError, onSettled]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  // 清理函數
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    mutate,
    reset
  };
}

// 分頁 API Hook
export function usePaginatedApi<T>(
  apiFunction: (page: number, limit: number) => Promise<{ data: T[]; total: number; page: number; limit: number }>,
  initialPage = 1,
  initialLimit = 10,
  options: ApiOptions<{ data: T[]; total: number; page: number; limit: number }> = {}
) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const paginatedApiFunction = useCallback(() => {
    return apiFunction(page, limit);
  }, [apiFunction, page, limit]);

  const result = useApi(paginatedApiFunction, [page, limit], options);

  const nextPage = useCallback(() => {
    if (result.data && page * limit < result.data.total) {
      setPage(prev => prev + 1);
    }
  }, [result.data, page, limit]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1) {
      setPage(newPage);
    }
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // 重置到第一頁
  }, []);

  return {
    ...result,
    page,
    limit,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    hasNextPage: result.data ? page * limit < result.data.total : false,
    hasPrevPage: page > 1,
    totalPages: result.data ? Math.ceil(result.data.total / limit) : 0
  };
}

export default useApi;
