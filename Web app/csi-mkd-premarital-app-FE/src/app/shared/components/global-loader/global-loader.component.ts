import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-global-loader',
  imports: [MatProgressSpinnerModule],
  template: `
    @if (loadingService.isLoading()) {
    <div class="loading-overlay" animate.enter="fadeIn" animate.leave="fadeOut">
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    </div>
    }
  `,
  styles: `
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .fadeIn {
      animation: global-loader-fade-in 0.2s ease both;
    }

    .fadeOut {
      animation: global-loader-fade-out 0.18s ease both;
    }

    @keyframes global-loader-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes global-loader-fade-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .fadeIn,
      .fadeOut {
        animation: none;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    /* Ensure spinner is visible in both light and dark themes */
    :host ::ng-deep .mat-mdc-progress-spinner circle {
      stroke: var(--md-sys-color-primary) !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalLoaderComponent {
  readonly loadingService = inject(LoadingService);
}
