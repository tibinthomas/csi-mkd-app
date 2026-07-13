import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdsenseService } from '../../core/services/adsense.service';

/**
 * Bottom-of-screen cookie consent banner. Advertising cookies (Google
 * AdSense) load only after the visitor accepts; declining keeps the site
 * fully functional with no ad cookies set.
 */
@Component({
  selector: 'app-cookie-consent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    @if (adsense.bannerVisible()) {
      <div
        class="cookie-consent-banner"
        role="dialog"
        aria-live="polite"
        aria-label="Cookie consent"
        i18n-aria-label
        data-testid="cookie-consent-banner"
      >
        <mat-icon aria-hidden="true" class="cookie-consent-icon"
          >cookie</mat-icon
        >
        <p class="cookie-consent-text" i18n>
          We use cookies to show advertisements that help support this free
          counselling service. Declining will not affect your use of the site.
        </p>
        <div class="cookie-consent-actions">
          <button
            mat-stroked-button
            (click)="adsense.denyConsent()"
            data-testid="cookie-consent-decline"
            i18n
          >
            Decline
          </button>
          <button
            mat-flat-button
            (click)="adsense.grantConsent()"
            data-testid="cookie-consent-accept"
            i18n
          >
            Accept
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    .cookie-consent-banner {
      position: fixed;
      inset-inline: 0;
      bottom: 0;
      z-index: 60;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      background: var(--mat-sys-surface-container-high, #fff);
      color: var(--mat-sys-on-surface, #1f1f1f);
      box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.18);
    }

    .cookie-consent-icon {
      flex-shrink: 0;
    }

    .cookie-consent-text {
      margin: 0;
      max-width: 44rem;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .cookie-consent-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }
  `,
})
export class CookieConsent {
  protected readonly adsense = inject(AdsenseService);
}
