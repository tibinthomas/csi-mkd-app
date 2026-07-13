import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import {
  RouterLink,
  RouterOutlet,
  RouterLinkActive,
  Router,
} from '@angular/router';
import { LanguageSelectorComponent } from '../shared/language-selector/language-selector';
import { AppFeedbackService } from '../core/services/app-feedback.service';
import { ThemeToggle } from '../shared/theme-toggle/theme-toggle';
import { DoubleTapDirective } from '../shared/directives/double-tap.directive';
import { CookieConsent } from '../shared/cookie-consent/cookie-consent';
import packageInfo from '../../../package.json';

@Component({
  selector: 'app-public-layout',
  styleUrl: './public-layout.scss',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    LanguageSelectorComponent,
    ThemeToggle,
    RouterLinkActive,
    DoubleTapDirective,
    CookieConsent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './public-layout.html',
})
export class PublicLayout {
  private router = inject(Router);
  private appFeedback = inject(AppFeedbackService);

  mobileMenuOpen = signal(false);
  currentYear = new Date().getFullYear();
  version = packageInfo.version;

  constructor() {
    this.appFeedback.registerVisitAndMaybePrompt();
  }

  openFeedback() {
    this.closeMobileMenu();
    this.appFeedback.open();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  goToAdmin() {
    this.router.navigate(['/admin/login']);
  }

  /** The settings rows render as full-width pills but the menu trigger is a
   *  small embedded button — forward taps anywhere on the row to it. */
  openSettingMenu(event: MouseEvent) {
    const row = event.currentTarget as HTMLElement;
    const button = row.querySelector('button');
    if (button && !button.contains(event.target as Node)) {
      button.click();
    }
  }
}
