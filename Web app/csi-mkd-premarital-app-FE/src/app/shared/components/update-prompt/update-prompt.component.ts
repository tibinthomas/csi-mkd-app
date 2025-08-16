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
    MatProgressSpinnerModule
  ],
  template: `
    @if (updateService.updateAvailable()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-sm">
        <mat-card class="max-w-md w-[90%] mx-4 shadow-2xl">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary" class="transform scale-110">system_update</mat-icon>
            <mat-card-title>New Version Available</mat-card-title>
            <mat-card-subtitle>
              A new version of the application is ready to install
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <p class="my-4 leading-relaxed">
              To ensure you have the latest features and security updates, 
              please update the application now. This will refresh all open tabs.
            </p>
          </mat-card-content>
          
          <mat-card-actions align="end" class="p-4 gap-2">
            <button 
              mat-button 
              (click)="updateService.dismissUpdate()"
              [disabled]="updateService.isUpdating()">
              Later
            </button>
            <button 
              mat-raised-button 
              color="primary"
              (click)="updateService.applyUpdate()"
              [disabled]="updateService.isUpdating()"
              class="flex items-center">
              @if (updateService.isUpdating()) {
                <mat-spinner diameter="20" class="mr-2"></mat-spinner>
                Updating...
              } @else {
                Update Now
              }
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdatePromptComponent {
  readonly updateService = inject(UpdateService);
}