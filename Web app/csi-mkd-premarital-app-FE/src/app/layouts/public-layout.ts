import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { LanguageSelectorComponent } from '../shared/language-selector/language-selector';

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
    LanguageSelectorComponent,
    RouterLinkActive,
  ],
  templateUrl: './public-layout.html',
})
export class PublicLayout {
  menuOpen = false;
  registerDropdownOpen = false;

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
