import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-global-loader',
  imports: [MatProgressSpinnerModule],
  template: `
    @if (loadingService.isLoading()) {
    <div class="loading-overlay">
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
