import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-success-dialog',
  standalone: true,
  imports: [MatDialogModule],
  styles: `.pt-serif-regular {
  font-family: 'PT Serif', serif;
  font-weight: 400;
  font-style: normal;
}

.pt-serif-bold {
  font-family: 'PT Serif', serif;
  font-weight: 700;
  font-style: normal;
}`,
  template: `
    <h2 mat-dialog-title class="pt-serif-bold">Registration Successful</h2>
    <mat-dialog-content class="!text-sm text-gray-700 pt-serif-regular">
      <p>Your premarital registration is complete!</p>
      A confirmation email will be sent to your registered email address.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close class=" pt-serif-bold">OK</button>
    </mat-dialog-actions>
  `,
})
export class SuccessDialogComponent {}
