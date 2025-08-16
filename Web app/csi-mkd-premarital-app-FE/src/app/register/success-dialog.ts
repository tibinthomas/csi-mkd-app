import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-success-dialog',

  imports: [MatDialogModule, MatButtonModule],
  styles: `.pt-serif-regular {
  font-family: 'PT Serif', 'Noto Serif Malayalam', 'Noto Sans Malayalam', 'Rachana', 'Karthika', 'Malayalam Sangam MN', serif;
  font-weight: 400;
  font-style: normal;
}

.pt-serif-bold {
  font-family: 'PT Serif', 'Noto Serif Malayalam', 'Noto Sans Malayalam', 'Rachana', 'Karthika', 'Malayalam Sangam MN', serif;
  font-weight: 700;
  font-style: normal;
}`,
  template: `
    <h2 mat-dialog-title class="pt-serif-bold">Registration Successful</h2>
    <mat-dialog-content class="!text-sm text-on-surface pt-serif-regular">
      <p>Your registration is complete!</p>
      @if(data.registerType !== 'pre-confirmation') {
      <p>A confirmation email will be sent to your registered email address.</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close class=" pt-serif-bold">
        OK
      </button>
    </mat-dialog-actions>
  `,
})
export class SuccessDialogComponent {
  data = inject(MAT_DIALOG_DATA) as { registerType: string };
}
