import {
  Component,
  ElementRef,
  HostListener,
  inject,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
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
import { MatSelectModule } from '@angular/material/select';
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
    MatMenuModule,
    MatDividerModule,
    LanguageSelectorComponent,
    ThemeToggle,
    RouterLinkActive,
    MatSelectModule,
    DoubleTapDirective,
  ],
  templateUrl: './public-layout.html',
})
export class PublicLayout {
  private router = inject(Router);

  menuOpen = false;
  registerDropdownOpen = false;
  currentYear = new Date().getFullYear();
  version = packageInfo.version;

  @ViewChild('menuRef') menuRef!: ElementRef;
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (!this.menuOpen) this.registerDropdownOpen = false;
  }

  toggleRegisterDropdown() {
    this.registerDropdownOpen = !this.registerDropdownOpen;
  }

  closeDropdown() {
    this.registerDropdownOpen = false;
  }

  onNavItemClick() {
    this.menuOpen = false;
    this.registerDropdownOpen = false;
  }

  goToAdmin() {
    this.router.navigate(['/admin/login']);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    // Close menu if click is outside menu and button
    if (
      this.menuOpen &&
      this.menuRef &&
      !this.menuRef.nativeElement.contains(target) &&
      !target.closest('button')
    ) {
      this.menuOpen = false;
      this.registerDropdownOpen = false;
    }

    // Close dropdown if click is outside dropdown
    if (
      this.registerDropdownOpen &&
      this.dropdownRef &&
      !this.dropdownRef.nativeElement.contains(target) &&
      !target.closest('button')
    ) {
      this.registerDropdownOpen = false;
    }
  }
}
