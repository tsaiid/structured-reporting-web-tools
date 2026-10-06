/**
 * 集中管理深色模式 (Dark Mode) 與亮色模式的主題邏輯
 * 確保跨頁面 (AJCC, NHI Lung-RADS, Landing) 主題存取與 data-theme 賦值行為一致
 */

/**
 * 取得儲存於 localStorage 的主題設定
 * @returns {'dark' | 'light' | null}
 */
export function getStoredTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch (e) {
    // 忽略 localStorage 存取異常（例如跨網域或安全性限制）
  }
  return null;
}

/**
 * 取得系統環境偏好主題 (prefers-color-scheme)
 * @returns {'dark' | 'light'}
 */
export function getSystemTheme() {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      // 降級為預設值
    }
  }
  return 'light';
}

/**
 * 取得偏好主題（優先使用儲存的設定，未設定則使用系統偏好）
 * @returns {'dark' | 'light'}
 */
export function getPreferredTheme() {
  const stored = getStoredTheme();
  if (stored) {
    return stored;
  }
  return getSystemTheme();
}

/**
 * 將主題套用至 document.documentElement (html 元素)
 * @param {'dark' | 'light'} theme
 * @returns {'dark' | 'light'}
 */
export function applyTheme(theme) {
  const targetTheme = theme === 'dark' ? 'dark' : 'light';
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-theme', targetTheme);
  }
  return targetTheme;
}

/**
 * 套用主題並儲存偏好至 localStorage
 * @param {'dark' | 'light'} theme
 * @returns {'dark' | 'light'}
 */
export function setTheme(theme) {
  const targetTheme = applyTheme(theme);
  try {
    localStorage.setItem('theme', targetTheme);
  } catch (e) {
    // 忽略 localStorage 存取異常
  }
  return targetTheme;
}

/**
 * 切換主題（dark <-> light）
 * @returns {'dark' | 'light'} 切換後的新主題
 */
export function toggleTheme() {
  const currentTheme =
    (typeof document !== 'undefined' && document.documentElement?.getAttribute('data-theme')) ||
    getPreferredTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  return setTheme(newTheme);
}

/**
 * 初始化主題設定
 * @param {(theme: 'dark' | 'light') => void} [onInit]
 * @returns {'dark' | 'light'}
 */
export function initTheme(onInit) {
  const preferred = getPreferredTheme();
  applyTheme(preferred);
  if (typeof onInit === 'function') {
    try {
      onInit(preferred);
    } catch (e) {
      console.error('Error in onInit callback:', e);
    }
  }
  return preferred;
}
