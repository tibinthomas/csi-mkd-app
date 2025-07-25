import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SessionConfigService } from '../../api/services';
import { catchError, map, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sessions',
  imports: [
    MatExpansionModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    DatePipe,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './sessions.html',
  styleUrl: './sessions.scss',
})
export class Sessions {
  private snackBar = inject(MatSnackBar);
  private readonly sessionConfigService = inject(SessionConfigService);

  private readonly sessions$ = this.sessionConfigService
    .apiSessionconfigGet()
    .pipe(
      map((data: any) => {
        const parsed = JSON.parse(data);
        return parsed.map((session: any) => ({
          ...session,
        }));
      }),
      catchError((err) => {
        console.error('Error loading sessions:', err);
        return of([]); // fallback to empty array
      })
    );

  protected readonly sessionList = toSignal(this.sessions$, {
    initialValue: [],
  });

  // Group sessions by Year -> Month
  groupedByYear = computed(() => {
    const groups: Record<string, Record<string, any>> = {};
    for (const session of this.sessionList()) {
      const date = new Date(session.StartDate);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('default', { month: 'long' });

      groups[year] ??= {};
      groups[year][month] ??= [];
      groups[year][month].push(session);
    }

    return Object.entries(groups).map(([year, monthsMap]) => ({
      year,
      months: Object.entries(monthsMap).map(([month, sessions]) => ({
        month,
        sessions,
      })),
    }));
  });

  // Expand/collapse tracking
  expandedYears: WritableSignal<Record<string, boolean>> = signal({});

  allExpanded = computed(() => {
    const yearMap = this.expandedYears();
    return Object.values(yearMap).every((v) => v);
  });

  toggleAll(): void {
    const state = this.allExpanded() ? false : true;
    const updated: Record<string, boolean> = {};
    for (const yearGroup of this.groupedByYear()) {
      updated[yearGroup.year] = state;
    }
    this.expandedYears.set(updated);
  }

  toggleYear(year: string): void {
    const current = this.expandedYears();
    this.expandedYears.set({
      ...current,
      [year]: !current[year],
    });
  }

  bookSession(session: any): void {
    this.snackBar.open(`Booked: ${session.title}`, 'Close', {
      duration: 3000,
    });
  }
}
