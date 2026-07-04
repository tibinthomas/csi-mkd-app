import { Injectable } from '@angular/core';

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CalendarService {
  buildGoogleCalendarUrl(event: CalendarEvent): string {
    const { start, end } = this.formatDateRange(event);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${start}/${end}`,
    });
    if (event.description) {
      params.set('details', event.description);
    }
    if (event.location) {
      params.set('location', event.location);
    }
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  downloadIcs(event: CalendarEvent): void {
    const blob = new Blob([this.buildIcs(event)], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.sanitizeFileName(event.title)}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private buildIcs(event: CalendarEvent): string {
    const { start, end } = this.formatDateRange(event);
    const dateField = event.allDay ? ';VALUE=DATE' : '';
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CSI MKD//Premarital Registration//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${this.generateUid()}`,
      `DTSTAMP:${this.toIcsDateTime(new Date())}`,
      `DTSTART${dateField}:${start}`,
      `DTEND${dateField}:${end}`,
      `SUMMARY:${this.escapeIcsText(event.title)}`,
    ];
    if (event.description) {
      lines.push(`DESCRIPTION:${this.escapeIcsText(event.description)}`);
    }
    if (event.location) {
      lines.push(`LOCATION:${this.escapeIcsText(event.location)}`);
    }
    lines.push('END:VEVENT', 'END:VCALENDAR');
    return lines.join('\r\n');
  }

  private formatDateRange(event: CalendarEvent): { start: string; end: string } {
    if (event.allDay) {
      const start = this.toIcsDate(event.startDate);
      // Google/ICS treat the end date of an all-day event as exclusive.
      const exclusiveEnd = new Date(event.endDate);
      exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
      return { start, end: this.toIcsDate(exclusiveEnd) };
    }
    return {
      start: this.toIcsDateTime(event.startDate),
      end: this.toIcsDateTime(event.endDate),
    };
  }

  private toIcsDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private toIcsDateTime(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private escapeIcsText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  private generateUid(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}@csimkd`;
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  }
}
