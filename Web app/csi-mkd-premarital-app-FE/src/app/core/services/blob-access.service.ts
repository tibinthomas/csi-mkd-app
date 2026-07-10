import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { RehydrationNoticeDialog } from '../../shared/components/rehydration-notice-dialog/rehydration-notice-dialog';

/**
 * Opens uploaded blob files while handling Azure archive-tier blobs:
 * available files open in a new tab; archived files trigger rehydration
 * and show a notice dialog instead of navigating to an unreadable blob.
 */
@Injectable({ providedIn: 'root' })
export class BlobAccessService {
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Key of the request currently in flight, or null when idle. Defaults to
   * the blob URL, but callers with more than one button for the same blob
   * (e.g. a "view" button and a separate "request" button) should pass a
   * distinct `key` to `openFile` so only the button actually clicked shows
   * a loading state.
   */
  readonly isRehydrating = signal<string | null>(null);

  async openFile(blobUrl: string, key: string = blobUrl): Promise<void> {
    this.isRehydrating.set(key);
    try {
      const { status } = await firstValueFrom(
        this.http.post<{ status: string }>(
          `${API_ROOT_URL_MAIN_APP}/api/azureupload/rehydrate`,
          { blobUrl },
        ),
      );

      if (status === 'already_available') {
        window.open(blobUrl, '_blank', 'noopener');
      } else if (status === 'rehydration_started') {
        this.dialog.open(RehydrationNoticeDialog, { maxWidth: '440px' });
      } else {
        this.snackBar.open(
          'File not found in storage. It may have been deleted.',
          'Close',
          { duration: 4000 },
        );
      }
    } catch (err) {
      this.snackBar.open(
        'Failed to open the file. Please try again.',
        'Close',
        {
          duration: 4000,
        },
      );
      console.error('Blob access request failed', err);
    } finally {
      this.isRehydrating.set(null);
    }
  }
}
