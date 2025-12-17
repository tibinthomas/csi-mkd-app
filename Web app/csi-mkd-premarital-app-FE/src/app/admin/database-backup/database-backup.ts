import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BackupService } from '../../../api/api-functions/services';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-database-backup',
  standalone: true,
  templateUrl: './database-backup.html',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabaseBackup {
  private readonly backupService = inject(BackupService);
  private readonly snackBar = inject(MatSnackBar);

  readonly isTriggeringBackup = signal(false);
  readonly isDownloadingBackup = signal(false);
  readonly lastBackupInfo = signal<{
    fileName: string;
    timestamp: string;
    message: string;
  } | null>(null);

  /**
   * Triggers a new database backup
   */
  triggerBackup(): void {
    this.isTriggeringBackup.set(true);

    this.backupService.triggerBackup().subscribe({
      next: (response) => {
        this.isTriggeringBackup.set(false);

        if (response.success) {
          this.lastBackupInfo.set({
            fileName: response.backupFileName || 'Unknown',
            timestamp: response.timestamp || new Date().toISOString(),
            message: response.message || 'Backup created successfully',
          });

          this.snackBar.open(
            response.message || 'Database backup triggered successfully!',
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            }
          );
        } else {
          this.snackBar.open(
            response.message || 'Backup trigger failed',
            'Close',
            {
              duration: 7000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            }
          );
        }
      },
      error: (error: Error) => {
        this.isTriggeringBackup.set(false);
        this.snackBar.open(
          error.message || 'Failed to trigger database backup',
          'Close',
          {
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          }
        );
      },
    });
  }

  /**
   * Downloads the latest backup file
   */
  downloadLatestBackup(): void {
    this.isDownloadingBackup.set(true);

    this.backupService.downloadLatestBackup$Response().subscribe({
      next: (response) => {
        this.isDownloadingBackup.set(false);

        if (response.body) {
          // Extract filename from Content-Disposition header or use default
          let filename = this.getFilenameFromResponse(response.headers);

          if (!filename) {
            const timestamp = new Date()
              .toISOString()
              .replace(/:/g, '-')
              .replace(/\..+/, '');
            filename = `database_backup_${timestamp}.sql`;
          }

          // Save the file
          saveAs(response.body, filename);

          this.snackBar.open(
            'Backup file downloaded successfully!',
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            }
          );
        }
      },
      error: (error: Error) => {
        this.isDownloadingBackup.set(false);
        this.snackBar.open(
          error.message || 'Failed to download backup file',
          'Close',
          {
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          }
        );
      },
    });
  }

  /**
   * Extracts filename from Content-Disposition header
   */
  private getFilenameFromResponse(headers: any): string | null {
    const contentDisposition = headers.get('Content-Disposition');
    if (!contentDisposition) {
      return null;
    }

    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
      contentDisposition
    );
    if (matches != null && matches[1]) {
      return matches[1].replace(/['"]/g, '');
    }

    return null;
  }
}
