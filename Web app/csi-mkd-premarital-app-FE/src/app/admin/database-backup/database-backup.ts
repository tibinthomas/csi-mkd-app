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
import { BackupService } from '../../../api/api-main-app/services';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of } from 'rxjs';

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

    this.backupService
      .triggerBackup$Response()
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.isTriggeringBackup.set(false);

          let errorMessage = $localize`Failed to trigger database backup`;

          if (error.status === 401) {
            errorMessage = $localize`Authentication failed. Please try logging in again.`;
          } else if (error.status === 403) {
            errorMessage = $localize`You do not have permission to perform this action.`;
          } else if (error.status === 500) {
            errorMessage = $localize`Server error occurred while creating backup. Please try again later.`;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.snackBar.open(errorMessage, $localize`Close`, {
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });

          // Return empty observable to complete the stream without re-throwing
          return of(null);
        }),
      )
      .subscribe({
        next: (response) => {
          if (!response) {
            // Error already handled in catchError
            return;
          }

          this.isTriggeringBackup.set(false);

          // Update last backup info with current timestamp
          this.lastBackupInfo.set({
            fileName: 'Backup created',
            timestamp: new Date().toISOString(),
            message: 'Database backup triggered successfully',
          });

          this.snackBar.open(
            $localize`Database backup triggered successfully!`,
            $localize`Close`,
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            },
          );
        },
      });
  }

  /**
   * Downloads the latest backup file
   */
  downloadLatestBackup(): void {
    this.isDownloadingBackup.set(true);

    this.backupService
      .downloadLatestBackup$Response()
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.isDownloadingBackup.set(false);

          let errorMessage = $localize`Failed to download backup file`;

          if (error.status === 401) {
            errorMessage = $localize`Authentication failed. Please try logging in again.`;
          } else if (error.status === 403) {
            errorMessage = $localize`You do not have permission to download backups.`;
          } else if (error.status === 404) {
            errorMessage = $localize`No backup file found. Please create a backup first.`;
          } else if (error.status === 500) {
            errorMessage = $localize`Server error occurred while downloading backup. Please try again later.`;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.snackBar.open(errorMessage, $localize`Close`, {
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });

          // Return empty observable to complete the stream without re-throwing
          return of(null);
        }),
      )
      .subscribe({
        next: (response) => {
          if (!response) {
            // Error already handled in catchError
            return;
          }

          this.isDownloadingBackup.set(false);

          // The endpoint is typed as void in the OpenAPI spec, but the
          // response body actually contains the backup file Blob.
          const body = response.body as unknown as Blob | null;
          if (body) {
            // Extract filename from Content-Disposition header or use default
            let filename = this.getFilenameFromResponse(response.headers);

            if (!filename) {
              const timestamp = new Date()
                .toISOString()
                .replace(/:/g, '-')
                .replace(/\..+/, '');
              filename = `database_backup_${timestamp}.sql`;
            }

            saveAs(body, filename);

            this.snackBar.open(
              $localize`Backup file downloaded successfully!`,
              $localize`Close`,
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['success-snackbar'],
              },
            );
          }
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
      contentDisposition,
    );
    if (matches != null && matches[1]) {
      return matches[1].replace(/['"]/g, '');
    }

    return null;
  }
}
