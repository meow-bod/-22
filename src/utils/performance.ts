// 效能監控工具
import React from 'react';

// 效能指標介面
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

// 效能監控類別
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  // 初始化效能觀察器
  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // 觀察導航時間
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.startTime);
              this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.startTime);
              this.recordMetric('first_paint', navEntry.loadEventStart - navEntry.startTime);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }

      // 觀察資源載入時間
      try {
        const resourceObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              this.recordMetric('resource_load_time', resourceEntry.responseEnd - resourceEntry.requestStart, {
                name: resourceEntry.name,
                type: resourceEntry.initiatorType
              });
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }
    }
  }

  // 記錄效能指標
  recordMetric(name: string, value: number, metadata?: Record<string, string | number | boolean>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    // 保持最近 100 個指標
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // 在開發環境中記錄到控制台
  }

  // 測量函數執行時間
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    this.recordMetric(name, end - start);
    return result;
  }

  // 測量異步函數執行時間
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    this.recordMetric(name, end - start);
    return result;
  }

  // 獲取指標統計
  getMetricStats(name: string) {
    const metrics = this.metrics.filter(m => m.name === name);
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      count: metrics.length,
      average: avg,
      min,
      max,
      total: sum
    };
  }

  // 獲取所有指標
  getAllMetrics() {
    return [...this.metrics];
  }

  // 清除指標
  clearMetrics() {
    this.metrics = [];
  }

  // 銷毀監控器
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// 創建全域實例
const performanceMonitor = new PerformanceMonitor();

// 導出工具函數
export const measurePerformance = {
  // 記錄指標
  record: (name: string, value: number, metadata?: Record<string, string | number | boolean>) => {
    performanceMonitor.recordMetric(name, value, metadata);
  },

  // 測量函數
  measure: <T>(name: string, fn: () => T): T => {
    return performanceMonitor.measureFunction(name, fn);
  },

  // 測量異步函數
  measureAsync: <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    return performanceMonitor.measureAsyncFunction(name, fn);
  },

  // 獲取統計
  getStats: (name: string) => {
    return performanceMonitor.getMetricStats(name);
  },

  // 獲取所有指標
  getAll: () => {
    return performanceMonitor.getAllMetrics();
  },

  // 清除指標
  clear: () => {
    performanceMonitor.clearMetrics();
  }
};

// React Hook 用於效能監控
export const usePerformanceMonitor = () => {
  return measurePerformance;
};

// 高階元件用於測量元件渲染時間
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithPerformanceMonitoring = (props: P) => {
    return measurePerformance.measure(`${displayName}_render`, () => React.createElement(WrappedComponent, props));
  };

  WithPerformanceMonitoring.displayName = `withPerformanceMonitoring(${displayName})`;

  return WithPerformanceMonitoring;
}

export default performanceMonitor;
