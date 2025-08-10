import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeType = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  
  private readonly _theme = signal<ThemeType>('system');
  private readonly _effectiveTheme = signal<EffectiveTheme>('light');
  private readonly _isTransitioning = signal(false);
  
  readonly theme = this._theme.asReadonly();
  readonly effectiveTheme = this._effectiveTheme.asReadonly();
  readonly isDark = computed(() => this._effectiveTheme() === 'dark');
  readonly isTransitioning = this._isTransitioning.asReadonly();
  
  private mediaQuery?: MediaQueryList;
  
  constructor() {
    if (this.isBrowser) {
      this.initializeTheme();
      this.setupSystemThemeListener();
    }
    
    // Effect to apply theme changes to DOM
    effect(() => {
      if (this.isBrowser) {
        this.applyThemeToDOM(this._effectiveTheme());
      }
    });
    
    // Effect to update effective theme when theme changes
    effect(() => {
      const theme = this._theme();
      if (theme === 'system') {
        this._effectiveTheme.set(this.getSystemTheme());
      } else {
        this._effectiveTheme.set(theme);
      }
    });
  }
  
  setTheme(theme: ThemeType): void {
    this._isTransitioning.set(true);
    this._theme.set(theme);
    
    if (this.isBrowser) {
      this.saveThemePreference(theme);
      
      // Reset transition flag after animation completes
      setTimeout(() => this._isTransitioning.set(false), 300);
    }
  }
  
  toggleTheme(): void {
    const currentTheme = this._theme();
    let nextTheme: ThemeType;
    
    switch (currentTheme) {
      case 'light':
        nextTheme = 'dark';
        break;
      case 'dark':
        nextTheme = 'system';
        break;
      case 'system':
      default:
        nextTheme = 'light';
        break;
    }
    
    this.setTheme(nextTheme);
  }
  
  private initializeTheme(): void {
    const savedTheme = this.loadThemePreference();
    this._theme.set(savedTheme);
  }
  
  private setupSystemThemeListener(): void {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Listen for system theme changes
    this.mediaQuery.addEventListener('change', (e) => {
      if (this._theme() === 'system') {
        this._effectiveTheme.set(e.matches ? 'dark' : 'light');
      }
    });
  }
  
  private getSystemTheme(): EffectiveTheme {
    if (!this.isBrowser) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  private applyThemeToDOM(theme: EffectiveTheme): void {
    const root = document.documentElement;
    const oppositeTheme = theme === 'dark' ? 'light' : 'dark';
    
    root.classList.remove(`theme-${oppositeTheme}`);
    root.classList.add(`theme-${theme}`);
    root.setAttribute('data-theme', theme);
    
    // Update color-scheme for better browser integration
    root.style.colorScheme = theme;
  }
  
  private saveThemePreference(theme: ThemeType): void {
    try {
      localStorage.setItem('csi-theme-preference', theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }
  
  private loadThemePreference(): ThemeType {
    if (!this.isBrowser) return 'system';
    
    try {
      const saved = localStorage.getItem('csi-theme-preference') as ThemeType;
      return saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      return 'system';
    }
  }
}