import { useEffect, useCallback, useRef, useState } from 'react';

// 焦點管理 Hook
export function useFocusManagement() {
  const currentFocusRef = useRef<HTMLElement | null>(null);

  // 儲存當前焦點
  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      currentFocusRef.current = activeElement;
    }
  }, []);

  // 恢復焦點
  const restoreFocus = useCallback(() => {
    if (currentFocusRef.current && document.contains(currentFocusRef.current)) {
      currentFocusRef.current.focus();
    }
  }, []);

  // 焦點陷阱（用於模態框等）
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // 設定初始焦點
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return {
    saveFocus,
    restoreFocus,
    trapFocus
  };
}

// 鍵盤導航 Hook
export function useKeyboardNavigation(
  items: HTMLElement[],
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
    onSelect?: (index: number) => void;
  } = {}
) {
  const { loop = true, orientation = 'both', onSelect } = options;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (items.length === 0) return;

      let newIndex = currentIndex;
      let handled = false;

      switch (e.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = loop ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
            handled = true;
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = loop ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
            handled = true;
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = loop ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = loop ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
            handled = true;
          }
          break;
        case 'Home':
          newIndex = 0;
          handled = true;
          break;
        case 'End':
          newIndex = items.length - 1;
          handled = true;
          break;
        case 'Enter':
        case ' ':
          if (onSelect) {
            onSelect(currentIndex);
            handled = true;
          }
          break;
      }

      if (handled) {
        e.preventDefault();
        setCurrentIndex(newIndex);
        items[newIndex]?.focus();
      }
    },
    [items, currentIndex, loop, orientation, onSelect]
  );

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown
  };
}

// 螢幕閱讀器公告 Hook
export function useScreenReader() {
  const announcementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 創建隱藏的公告區域
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcementRef.current = announcement;

    return () => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;

      // 清除訊息以便下次公告
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return { announce };
}

// 顏色對比檢查工具
export function checkColorContrast(
  foreground: string,
  background: string
): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} {
  // 將顏色轉換為 RGB
  const getRGB = (color: string): [number, number, number] => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  };

  // 計算相對亮度
  const getLuminance = ([r, g, b]: [number, number, number]): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  try {
    const fgRGB = getRGB(foreground);
    const bgRGB = getRGB(background);

    const fgLuminance = getLuminance(fgRGB);
    const bgLuminance = getLuminance(bgRGB);

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    const ratio = (lighter + 0.05) / (darker + 0.05);

    return {
      ratio,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7
    };
  } catch (error) {
    console.error('Color contrast check failed:', error);
    return {
      ratio: 0,
      wcagAA: false,
      wcagAAA: false
    };
  }
}

// 減少動畫偏好檢查
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    // 設定初始值
    handleChange();

    // 監聽變化
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}

// 高對比模式檢查
export function usePrefersHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');

    const handleChange = () => {
      setPrefersHighContrast(mediaQuery.matches);
    };

    // 設定初始值
    handleChange();

    // 監聽變化
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersHighContrast;
}

// 無障礙屬性生成器
export function generateAriaProps({
  label,
  labelledBy,
  describedBy,
  expanded,
  selected,
  checked,
  disabled,
  required,
  invalid,
  live,
  atomic
}: {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  live?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
} = {}) {
  const props: Record<string, string | boolean> = {};

  if (label) props['aria-label'] = label;
  if (labelledBy) props['aria-labelledby'] = labelledBy;
  if (describedBy) props['aria-describedby'] = describedBy;
  if (expanded !== undefined) props['aria-expanded'] = expanded;
  if (selected !== undefined) props['aria-selected'] = selected;
  if (checked !== undefined) props['aria-checked'] = checked;
  if (disabled !== undefined) props['aria-disabled'] = disabled;
  if (required !== undefined) props['aria-required'] = required;
  if (invalid !== undefined) props['aria-invalid'] = invalid;
  if (live) props['aria-live'] = live;
  if (atomic !== undefined) props['aria-atomic'] = atomic;

  return props;
}

// 跳過連結元件 Hook
export function useSkipLinks() {
  const skipLinksRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.style.position = 'absolute';
    skipLinks.style.top = '-40px';
    skipLinks.style.left = '6px';
    skipLinks.style.zIndex = '1000';
    skipLinks.style.background = '#000';
    skipLinks.style.color = '#fff';
    skipLinks.style.padding = '8px';
    skipLinks.style.textDecoration = 'none';
    skipLinks.style.borderRadius = '4px';
    skipLinks.style.transition = 'top 0.3s';

    const mainLink = document.createElement('a');
    mainLink.href = '#main-content';
    mainLink.textContent = '跳到主要內容';
    mainLink.style.color = '#fff';
    mainLink.style.textDecoration = 'none';

    mainLink.addEventListener('focus', () => {
      skipLinks.style.top = '6px';
    });

    mainLink.addEventListener('blur', () => {
      skipLinks.style.top = '-40px';
    });

    skipLinks.appendChild(mainLink);
    document.body.insertBefore(skipLinks, document.body.firstChild);
    skipLinksRef.current = skipLinks;

    return () => {
      if (skipLinks.parentNode) {
        skipLinks.parentNode.removeChild(skipLinks);
      }
    };
  }, []);

  return skipLinksRef;
}

export default {
  useFocusManagement,
  useKeyboardNavigation,
  useScreenReader,
  checkColorContrast,
  usePrefersReducedMotion,
  usePrefersHighContrast,
  generateAriaProps,
  useSkipLinks
};
