import { Component, Inject, LOCALE_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';

interface Language {
  code: string;
  name: string;
}

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.html',
  styleUrls: ['./language-selector.scss'],
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatIconModule, CommonModule],
})
export class LanguageSelectorComponent {
  languages: Language[] = [
    { code: 'en-US', name: 'English' },
    { code: 'ml', name: 'മലയാളം' },
  ];

  currentLanguage: Language;

  constructor(@Inject(LOCALE_ID) private localeId: string) {
    this.currentLanguage =
      this.languages.find((lang) => lang.code === this.localeId) ||
      this.languages[0];
  }

  changeLanguage(langCode: string): void {
    if (langCode !== this.localeId) {
      const newUrl = window.location.pathname.replace(
        `/${this.localeId}/`,
        `/${langCode}/`
      );
      window.location.href = newUrl;
    }
  }
}
