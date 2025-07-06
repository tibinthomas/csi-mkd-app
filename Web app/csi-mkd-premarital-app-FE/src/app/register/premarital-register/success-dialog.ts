import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-success-dialog',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <h2 mat-dialog-title class="text-green-700">Registration Successful</h2>
    <mat-dialog-content class="text-sm text-gray-700">
      Your premarital registration has been submitted successfully. A
      confirmation email will be sent to your registered email address.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close color="primary">OK</button>
    </mat-dialog-actions>
  `,
})
export class SuccessDialogComponent {}
