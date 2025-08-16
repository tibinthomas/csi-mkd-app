import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface SuccessDialogData {
  title?: string;
  messages: string[]; // multiple messages
  extraMessage?: string; // optional extra line
}

@Component({
  selector: 'app-success-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './success-dialog.html',
  styleUrl: './success-dialog.scss',
})
export class SuccessDialog {
  data = inject(MAT_DIALOG_DATA) as SuccessDialogData;
}
