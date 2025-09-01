import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UpdateService } from '../../../core/services/update.service';

@Component({
  selector: 'app-update-prompt',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    @if (updateService.updateAvailable()) {
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-sm"
    >
      <mat-card class="max-w-md w-[90%] mx-4 shadow-2xl">
        <mat-card-header>
          <mat-icon mat-card-avatar color="primary" class="transform scale-110"
            >system_update</mat-icon
          >
          <mat-card-title><span i18n>New Version Available</span></mat-card-title>
          <mat-card-subtitle>
          <span i18n>A new version of the application is ready to install</span>  
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <p class="my-4 leading-relaxed" i18n>
            To ensure you have the latest features and security updates, please
            update the application now. This will refresh all open tabs.
          </p>
        </mat-card-content>

        <mat-card-actions align="end" class="p-4 gap-2">
          <button
            mat-button
            (click)="updateService.dismissUpdate()"
            [disabled]="updateService.isUpdating()"
          >
           <span i18n> Later</span>
          </button>
          <button
            mat-raised-button
            color="primary"
            (click)="updateService.applyUpdate()"
            [disabled]="updateService.isUpdating()"
            class="flex items-center"
          >
            @if (updateService.isUpdating()) {<span i18n>Updating...</span>  } @else { <span i18n>Update Now</span>
            }
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdatePromptComponent {
  readonly updateService = inject(UpdateService);
}
