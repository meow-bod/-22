import { useState, useEffect, useCallback } from 'react';

// 斷點定義
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type Breakpoint = keyof typeof breakpoints;

// 媒體查詢字串
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
  // 範圍查詢
  'xs-only': `(max-width: ${breakpoints.sm - 1}px)`,
  'sm-only': `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`,
  'md-only': `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  'lg-only': `(min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`,
  'xl-only': `(min-width: ${breakpoints.xl}px) and (max-width: ${breakpoints['2xl'] - 1}px)`,
  // 向下查詢
  'sm-down': `(max-width: ${breakpoints.md - 1}px)`,
  'md-down': `(max-width: ${breakpoints.lg - 1}px)`,
  'lg-down': `(max-width: ${breakpoints.xl - 1}px)`,
  'xl-down': `(max-width: ${breakpoints['2xl'] - 1}px)`
} as const;

export type MediaQuery = keyof typeof mediaQueries;

// 獲取當前斷點
function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

// 檢查是否匹配斷點
function isBreakpointMatch(currentWidth: number, breakpoint: Breakpoint | MediaQuery): boolean {
  // 如果是基本斷點
  if (breakpoint in breakpoints) {
    return currentWidth >= breakpoints[breakpoint as Breakpoint];
  }

  // 如果是媒體查詢
  const query = mediaQueries[breakpoint as MediaQuery];
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia(query).matches;
  }

  // 伺服器端渲染時的回退邏輯
  switch (breakpoint) {
    case 'xs-only':
      return currentWidth < breakpoints.sm;
    case 'sm-only':
      return currentWidth >= breakpoints.sm && currentWidth < breakpoints.md;
    case 'md-only':
      return currentWidth >= breakpoints.md && currentWidth < breakpoints.lg;
    case 'lg-only':
      return currentWidth >= breakpoints.lg && currentWidth < breakpoints.xl;
    case 'xl-only':
      return currentWidth >= breakpoints.xl && currentWidth < breakpoints['2xl'];
    case 'sm-down':
      return currentWidth < breakpoints.md;
    case 'md-down':
      return currentWidth < breakpoints.lg;
    case 'lg-down':
      return currentWidth < breakpoints.xl;
    case 'xl-down':
      return currentWidth < breakpoints['2xl'];
    default:
      return false;
  }
}

// 響應式 Hook
export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(getCurrentBreakpoint(windowSize.width));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      setWindowSize({ width: newWidth, height: newHeight });
      setCurrentBreakpoint(getCurrentBreakpoint(newWidth));
    };

    // 使用 ResizeObserver 如果可用，否則使用 resize 事件
    let resizeObserver: ResizeObserver | null = null;

    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(document.documentElement);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // 初始化
    handleResize();

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // 檢查是否匹配特定斷點
  const isMatch = useCallback(
    (breakpoint: Breakpoint | MediaQuery) => {
      return isBreakpointMatch(windowSize.width, breakpoint);
    },
    [windowSize.width]
  );

  // 檢查是否為行動裝置
  const isMobile = isMatch('sm-down');

  // 檢查是否為平板
  const isTablet = isMatch('md-only') || isMatch('lg-only');

  // 檢查是否為桌面
  const isDesktop = isMatch('xl');

  // 檢查螢幕方向
  const isLandscape = windowSize.width > windowSize.height;
  const isPortrait = windowSize.height > windowSize.width;

  return {
    windowSize,
    currentBreakpoint,
    isMatch,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    // 便利方法
    isXs: currentBreakpoint === 'xs',
    isSm: currentBreakpoint === 'sm',
    isMd: currentBreakpoint === 'md',
    isLg: currentBreakpoint === 'lg',
    isXl: currentBreakpoint === 'xl',
    is2Xl: currentBreakpoint === '2xl',
    // 範圍檢查
    isSmUp: isMatch('sm'),
    isMdUp: isMatch('md'),
    isLgUp: isMatch('lg'),
    isXlUp: isMatch('xl'),
    is2XlUp: isMatch('2xl'),
    isSmDown: isMatch('sm-down'),
    isMdDown: isMatch('md-down'),
    isLgDown: isMatch('lg-down'),
    isXlDown: isMatch('xl-down')
  };
}

// 媒體查詢 Hook
export function useMediaQuery(query: string | MediaQuery) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryString = typeof query === 'string' ? query : mediaQueries[query];
    const mediaQueryList = window.matchMedia(mediaQueryString);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // 設定初始值
    setMatches(mediaQueryList.matches);

    // 監聽變化
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
    } else {
      // 舊版瀏覽器支援
      mediaQueryList.addListener(handleChange);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleChange);
      } else {
        mediaQueryList.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

// 響應式值 Hook
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>> | T[], defaultValue?: T): T | undefined {
  const { currentBreakpoint } = useResponsive();

  if (Array.isArray(values)) {
    // 如果是陣列，按順序對應斷點
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const index = breakpointOrder.indexOf(currentBreakpoint);

    // 找到最接近的值
    for (let i = index; i >= 0; i--) {
      if (values[i] !== undefined) {
        return values[i];
      }
    }

    return defaultValue;
  }

  // 如果是物件，按斷點優先級查找
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

  // 從當前斷點開始向下查找
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const breakpoint = breakpointOrder[i];
    if (values[breakpoint] !== undefined) {
      return values[breakpoint];
    }
  }

  return defaultValue;
}

// 響應式類名 Hook
export function useResponsiveClassName(classNames: Partial<Record<Breakpoint | MediaQuery, string>>): string {
  const { isMatch } = useResponsive();

  const activeClasses: string[] = [];

  Object.entries(classNames).forEach(([breakpoint, className]) => {
    if (className && isMatch(breakpoint as Breakpoint | MediaQuery)) {
      activeClasses.push(className);
    }
  });

  return activeClasses.join(' ');
}

// 工具函數：生成響應式樣式
export function generateResponsiveStyles<T>(
  property: string,
  values: Partial<Record<Breakpoint, T>>
): Record<string, any> {
  const styles: Record<string, any> = {};

  Object.entries(values).forEach(([breakpoint, value]) => {
    const bp = breakpoint as Breakpoint;
    if (bp === 'xs') {
      styles[property] = value;
    } else {
      const mediaQuery = `@media ${mediaQueries[bp]}`;
      if (!styles[mediaQuery]) {
        styles[mediaQuery] = {};
      }
      (styles[mediaQuery] as Record<string, T>)[property] = value as T;
    }
  });

  return styles;
}

export default useResponsive;
