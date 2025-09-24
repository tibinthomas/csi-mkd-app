import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface DialogData {
  title?: string;
  messages: string[]; // multiple messages
  extraMessage?: string; // optional extra line
}

@Component({
  selector: 'app-success-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './dialog-popup.html',
  styleUrl: './dialog-popup.scss',
})
export class Dialog {
  data = inject(MAT_DIALOG_DATA) as DialogData;
}
