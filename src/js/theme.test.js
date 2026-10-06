import {
  getStoredTheme,
  getSystemTheme,
  getPreferredTheme,
  applyTheme,
  setTheme,
  toggleTheme,
  initTheme,
} from './theme';

describe('Theme Management Module', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    delete window.matchMedia;
  });

  describe('getStoredTheme', () => {
    test('returns null when nothing is stored', () => {
      expect(getStoredTheme()).toBeNull();
    });

    test('returns stored valid theme', () => {
      localStorage.setItem('theme', 'dark');
      expect(getStoredTheme()).toBe('dark');

      localStorage.setItem('theme', 'light');
      expect(getStoredTheme()).toBe('light');
    });

    test('returns null when stored value is invalid', () => {
      localStorage.setItem('theme', 'blue');
      expect(getStoredTheme()).toBeNull();
    });

    test('handles localStorage getItem throwing safely', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => {
        throw new Error('Access denied');
      });

      expect(getStoredTheme()).toBeNull();
      localStorage.getItem = originalGetItem;
    });
  });

  describe('getSystemTheme', () => {
    test('defaults to light when matchMedia is unavailable', () => {
      expect(getSystemTheme()).toBe('light');
    });

    test('returns dark when prefers-color-scheme matches dark', () => {
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
      }));
      expect(getSystemTheme()).toBe('dark');
    });

    test('returns light when prefers-color-scheme does not match dark', () => {
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
      }));
      expect(getSystemTheme()).toBe('light');
    });
  });

  describe('getPreferredTheme', () => {
    test('prefers stored theme over system theme', () => {
      localStorage.setItem('theme', 'light');
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: true, // system is dark
      }));

      expect(getPreferredTheme()).toBe('light');
    });

    test('falls back to system theme when no stored theme exists', () => {
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: true,
      }));

      expect(getPreferredTheme()).toBe('dark');
    });
  });

  describe('applyTheme', () => {
    test('sets data-theme attribute on documentElement', () => {
      applyTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      applyTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    test('normalizes unknown values to light', () => {
      applyTheme('custom');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('setTheme', () => {
    test('applies theme and writes to localStorage', () => {
      const applied = setTheme('dark');
      expect(applied).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    test('handles localStorage setItem throwing gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => setTheme('dark')).not.toThrow();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      localStorage.setItem = originalSetItem;
    });
  });

  describe('toggleTheme', () => {
    test('toggles from light to dark', () => {
      document.documentElement.setAttribute('data-theme', 'light');
      const next = toggleTheme();
      expect(next).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    test('toggles from dark to light', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      const next = toggleTheme();
      expect(next).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    test('uses preferred theme when data-theme attribute is not set', () => {
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: true, // prefers dark
      }));
      // current preferred is dark, so toggle should switch to light
      const next = toggleTheme();
      expect(next).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('initTheme', () => {
    test('applies preferred theme and invokes callback', () => {
      localStorage.setItem('theme', 'dark');
      const callback = jest.fn();

      const theme = initTheme(callback);
      expect(theme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(callback).toHaveBeenCalledWith('dark');
    });

    test('functions correctly when callback is omitted', () => {
      localStorage.setItem('theme', 'light');
      expect(() => initTheme()).not.toThrow();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    test('handles callback throwing error safely', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() =>
        initTheme(() => {
          throw new Error('Callback failed');
        }),
      ).not.toThrow();
      spy.mockRestore();
    });
  });
});
