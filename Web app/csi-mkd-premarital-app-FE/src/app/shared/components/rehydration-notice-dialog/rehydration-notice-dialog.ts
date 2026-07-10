import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rehydration-notice-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="flex items-center gap-2">
      <mat-icon color="primary">history</mat-icon>
      <span i18n>File is being retrieved</span>
    </h2>
    <mat-dialog-content>
      <p i18n>
        This file was archived because it is older than 1 month. Retrieval from
        the archive has started and the file will be available in
        <strong>2 to 10 hours</strong>, depending on its size.
      </p>
      <p class="mt-2 text-sm text-on-surface-variant" i18n>
        No further action is needed &mdash; please come back and open the file
        again later.
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
          Note: retrieving files from archive storage incurs an additional cloud
          storage cost. Only request a file when you actually need it.
        </span>
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close i18n>OK</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RehydrationNoticeDialog {}
