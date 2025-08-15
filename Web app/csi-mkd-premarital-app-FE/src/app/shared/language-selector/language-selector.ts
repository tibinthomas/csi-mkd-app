import { Component, Inject, LOCALE_ID, DOCUMENT } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

interface Language {
  code: string;
  name: string;
}

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.html',
  styleUrls: ['./language-selector.scss'],

  imports: [MatButtonModule, MatMenuModule, MatIconModule, CommonModule],
})
export class LanguageSelectorComponent {
  languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'ml', name: 'മലയാളം' },
  ];

  currentLanguage: Language;

  constructor(
    @Inject(LOCALE_ID) private localeId: string,
    @Inject(DOCUMENT) private document: Document,
    private location: Location
  ) {
    this.currentLanguage =
      this.languages.find((lang) => lang.code === this.localeId) ||
      this.languages[0];
  }

  changeLanguage(langCode: string): void {
    if (langCode !== this.localeId) {
      // Get current path without hash
      const currentPath = this.location.path();
      
      // Build new URL with the selected locale
      const baseUrl = this.document.location.origin;
      const newUrl = `${baseUrl}/${langCode}${currentPath}`;
      
      // Navigate to the new URL while preserving the current route
      this.document.location.href = newUrl;
    }
  }
}
