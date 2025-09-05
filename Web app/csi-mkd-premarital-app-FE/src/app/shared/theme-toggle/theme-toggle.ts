import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService, ThemeType } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="themeMenu"
      [attr.aria-label]="ariaLabel()"
      [matTooltip]="tooltipText()"
      class="theme-toggle-button theme-transition">
      <mat-icon [attr.aria-hidden]="true">{{ currentIcon() }}</mat-icon>
    </button>

    <mat-menu #themeMenu="matMenu" class="theme-menu">
      <button 
        mat-menu-item 
        (click)="setTheme('light')"
        [class.active]="themeService.theme() === 'light'"
        role="menuitemradio"
        [attr.aria-checked]="themeService.theme() === 'light'">
        <mat-icon>light_mode</mat-icon>
        <span i18n>Light</span>
      </button>
      
      <button 
        mat-menu-item 
        (click)="setTheme('dark')"
        [class.active]="themeService.theme() === 'dark'"
        role="menuitemradio"
        [attr.aria-checked]="themeService.theme() === 'dark'">
        <mat-icon>dark_mode</mat-icon>
        <span i18n>Dark</span>
      </button>
      
      <button 
        mat-menu-item 
        (click)="setTheme('system')"
        [class.active]="themeService.theme() === 'system'"
        role="menuitemradio"
        [attr.aria-checked]="themeService.theme() === 'system'">
        <mat-icon>brightness_auto</mat-icon>
        <span i18n>System</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .theme-toggle-button {
      position: relative;
    }

    .theme-menu {
      min-width: 140px;
    }

    .theme-menu .mat-mdc-menu-item {
      min-height: 48px;
    }

    .theme-menu .mat-mdc-menu-item.active {
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }

    .theme-menu .mat-mdc-menu-item.active .mat-icon {
      color: var(--md-sys-color-primary);
    }

    .theme-menu .mat-icon {
      margin-right: 12px;
      opacity: 0.7;
    }

    .theme-menu .mat-mdc-menu-item.active .mat-icon {
      opacity: 1;
    }

    /* Smooth icon transition */
    .theme-toggle-button .mat-icon {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .theme-toggle-button:hover .mat-icon {
      transform: scale(1.1);
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .theme-menu .mat-mdc-menu-item.active {
        border: 2px solid;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .theme-toggle-button .mat-icon,
      .theme-toggle-button {
        transition: none !important;
      }
    }
  `]
})
export class ThemeToggle {
  protected readonly themeService = inject(ThemeService);

  protected readonly currentIcon = computed(() => {
    const theme = this.themeService.theme();
    switch (theme) {
      case 'light':
        return 'light_mode';
      case 'dark':
        return 'dark_mode';
      case 'system':
      default:
        return 'brightness_auto';
    }
  });

  protected readonly tooltipText = computed(() => {
    const theme = this.themeService.theme();
    const effective = this.themeService.effectiveTheme();
    
    switch (theme) {
      case 'light':
        return 'Theme: Light';
      case 'dark':
        return 'Theme: Dark';
      case 'system':
        return `Theme: System (${effective})`;
      default:
        return 'Change theme';
    }
  });

  protected readonly ariaLabel = computed(() => {
    const theme = this.themeService.theme();
    return `Current theme: ${theme}. Click to change theme`;
  });

  protected setTheme(theme: ThemeType): void {
    this.themeService.setTheme(theme);
  }
}