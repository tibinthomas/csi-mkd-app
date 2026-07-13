import {
  Component,
  ChangeDetectionStrategy,
  afterRenderEffect,
  inject,
  input,
} from '@angular/core';
import { AdsenseService } from '../../core/services/adsense.service';

/**
 * A responsive Google AdSense display unit. Renders nothing until the visitor
 * has accepted advertising cookies and a publisher id is configured, so it is
 * safe to place on any public page.
 *
 * `adSlot` is the ad-unit slot id from the AdSense dashboard.
 */
@Component({
  selector: 'app-ad-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (adsense.adsEnabled()) {
      <div class="ad-banner" data-testid="ad-banner">
        <p class="ad-banner-label" i18n>Advertisement</p>
        <ins
          class="adsbygoogle"
          style="display: block"
          [attr.data-ad-client]="adsense.clientId"
          [attr.data-ad-slot]="adSlot()"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    }
  `,
  styles: `
    .ad-banner {
      max-width: 64rem;
      margin: 2rem auto 0;
      padding: 0 1.5rem;
    }

    .ad-banner-label {
      margin: 0 0 0.25rem;
      font-size: 0.625rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      opacity: 0.6;
    }
  `,
})
export class AdBanner {
  protected readonly adsense = inject(AdsenseService);

  readonly adSlot = input.required<string>();

  private adRequested = false;

  constructor() {
    // The <ins> only exists once adsEnabled flips true (possibly after the
    // visitor accepts mid-session), so request the ad after that render.
    afterRenderEffect(() => {
      if (this.adsense.adsEnabled() && !this.adRequested) {
        this.adRequested = true;
        this.adsense.requestAd();
      }
    });
  }
}
