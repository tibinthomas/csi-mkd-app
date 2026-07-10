import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Asks the admin to confirm retrieving an archived blob before rehydration
 * is started. Closes with `true` (retrieve) or `false`/undefined (cancel).
 */
@Component({
  selector: 'app-archive-retrieval-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="flex items-center gap-2">
      <mat-icon color="primary">unarchive</mat-icon>
      <span i18n>Retrieve file from archive?</span>
    </h2>
    <mat-dialog-content>
      <p i18n>
        This file was archived because it is older than 1 month. To view it, it
        must first be retrieved from archive storage, which takes
        <strong>2 to 10 hours</strong>.
      </p>
      <p
        class="mt-2 flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400"
      >
        <mat-icon
          class="!text-[18px] !w-[18px] !h-[18px] shrink-0"
          aria-hidden="true"
          >paid</mat-icon
        >
        <span i18n>
          Retrieving a file from archive storage incurs an additional cloud
          storage cost. Only retrieve this file if you actually need it.
        </span>
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" i18n>No</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="true" i18n>
        Yes, retrieve
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchiveRetrievalConfirmDialog {}
