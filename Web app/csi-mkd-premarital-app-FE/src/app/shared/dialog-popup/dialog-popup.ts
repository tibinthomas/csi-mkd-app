import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import {
  CalendarEvent,
  CalendarService,
} from '../../core/services/calendar.service';

export interface DialogData {
  title?: string;
  messages: string[]; // multiple messages
  extraMessage?: string; // optional extra line
  calendarEvent?: CalendarEvent; // optional "Add to Calendar" details
}

@Component({
  selector: 'app-success-dialog',
  imports: [MatDialogModule, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './dialog-popup.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dialog-popup.scss',
})
export class Dialog {
  data = inject(MAT_DIALOG_DATA) as DialogData;
  private readonly calendarService = inject(CalendarService);

  addToGoogleCalendar(): void {
    if (!this.data.calendarEvent) return;
    const url = this.calendarService.buildGoogleCalendarUrl(
      this.data.calendarEvent
    );
    window.open(url, '_blank', 'noopener');
  }

  downloadIcs(): void {
    if (!this.data.calendarEvent) return;
    this.calendarService.downloadIcs(this.data.calendarEvent);
  }
}
