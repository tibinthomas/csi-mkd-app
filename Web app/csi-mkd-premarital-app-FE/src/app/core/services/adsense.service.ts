import { Injectable, computed, signal } from '@angular/core';

export type CookieConsentStatus = 'unknown' | 'granted' | 'denied';

const CONSENT_STORAGE_KEY = 'csi-mkd-cookie-consent';

declare global {
  interface Window {
    adsbygoogle?: object[];
  }
}

/**
 * Manages advertising cookie consent and the Google AdSense script.
 *
 * The AdSense script (and therefore any advertising cookie) is only loaded
 * after the visitor explicitly accepts via the cookie consent banner, and only
 * when a publisher id is configured (ADSENSE_CLIENT_ID build-time constant —
 * empty in development, so ads are production-only by default).
 */
@Injectable({ providedIn: 'root' })
export class AdsenseService {
  private readonly status = signal<CookieConsentStatus>(
    this.readStoredConsent(),
  );
  private scriptLoaded = false;

  readonly clientId = ADSENSE_CLIENT_ID;
  readonly consentStatus = this.status.asReadonly();

  /** True when a publisher id is configured and the visitor accepted cookies. */
  readonly adsEnabled = computed(
    () => !!this.clientId && this.status() === 'granted',
  );

  /** The banner shows only while no choice was made and ads are configured. */
  readonly bannerVisible = computed(
    () => !!this.clientId && this.status() === 'unknown',
  );

  constructor() {
    if (this.adsEnabled()) {
      this.loadScript();
    }
  }

  grantConsent(): void {
    this.storeConsent('granted');
    this.status.set('granted');
    this.loadScript();
  }

  denyConsent(): void {
    this.storeConsent('denied');
    this.status.set('denied');
  }

  /**
   * Queues an ad request for an `<ins class="adsbygoogle">` element already
   * rendered in the DOM. Call once per ad element.
   */
  requestAd(): void {
    if (!this.adsEnabled()) {
      return;
    }
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.warn('AdSense ad request failed:', error);
    }
  }

  private readStoredConsent(): CookieConsentStatus {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      return stored === 'granted' || stored === 'denied' ? stored : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private storeConsent(status: CookieConsentStatus): void {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, status);
    } catch {
      // Private browsing may block storage; the choice still applies in-session.
    }
  }

  private loadScript(): void {
    if (this.scriptLoaded || !this.clientId) {
      return;
    }
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      console.warn('AdSense script failed to load (blocked or offline).');
    };
    document.head.appendChild(script);
    this.scriptLoaded = true;
  }
}
