import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy
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
import { ThemeToggle } from '../shared/theme-toggle/theme-toggle';
import { DoubleTapDirective } from '../shared/directives/double-tap.directive';
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
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './public-layout.html',
})
export class PublicLayout {
  private router = inject(Router);

  mobileMenuOpen = signal(false);
  currentYear = new Date().getFullYear();
  version = packageInfo.version;

  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  goToAdmin() {
    this.router.navigate(['/admin/login']);
  }
}
