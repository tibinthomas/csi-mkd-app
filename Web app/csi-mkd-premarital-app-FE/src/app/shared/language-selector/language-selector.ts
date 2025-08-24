import { Component, Inject, LOCALE_ID, DOCUMENT, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';

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
  private swUpdate = inject(SwUpdate);

  constructor(
    @Inject(LOCALE_ID) private localeId: string,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.currentLanguage =
      this.languages.find((lang) => lang.code === this.localeId) ||
      this.languages[0];
  }

  async changeLanguage(langCode: string): Promise<void> {
    if (langCode !== this.localeId) {
      try {
        // Clear service worker cache to force fresh content
        if (this.swUpdate.isEnabled && 'caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }
        
        // Unregister service worker temporarily to prevent serving cached content
        if ('serviceWorker' in navigator && this.swUpdate.isEnabled) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.unregister();
          }
        }
      } catch (error) {
        console.warn('Failed to clear cache on language change:', error);
      }

      // Get the current full URL including hash
      const currentUrl = this.document.location.href;
      const baseUrl = this.document.location.origin;
      
      // Extract the hash portion (everything after #)
      const hashIndex = currentUrl.indexOf('#');
      const hashPortion = hashIndex !== -1 ? currentUrl.substring(hashIndex) : '#/';
      
      // Build new URL with the selected locale and preserve the hash
      const newUrl = `${baseUrl}/${langCode}/${hashPortion}`;

      // Add cache-busting parameter and navigate to force fresh content
      const separator = newUrl.includes('?') ? '&' : '?';
      const cacheBuster = `${separator}_t=${Date.now()}`;
      
      // Navigate to the new URL while preserving the current route
      this.document.location.href = newUrl + cacheBuster;
    }
  }
}
