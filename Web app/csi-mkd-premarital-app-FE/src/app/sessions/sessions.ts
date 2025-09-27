import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  resource,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SessionsFallbackService } from '../core/services/sessions-fallback.service';
import { DatePipe } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sessions',
  imports: [
    MatExpansionModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    DatePipe,
    RouterOutlet,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sessions.html',
  styleUrl: './sessions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sessions {
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly api = inject(SessionsFallbackService);

  // Use resource for better data loading and state management
  readonly sessionsResource = resource({
    loader: async () => {
      try {
        return await firstValueFrom(this.api.getAllSessions());
      } catch (error) {
        console.error('Error loading sessions:', error);
        this.snackBar.open('Failed to load sessions', 'Close', {
          duration: 3000,
        });
        return [];
      }
    },
  });

  // Simplified grouping logic using computed
  readonly groupedSessions = computed(() => {
    const sessions = this.sessionsResource.value();
    if (!sessions || !Array.isArray(sessions)) return [];

    const activeSessions = sessions.filter((session: any) => session.isActive);

    const yearGroups = new Map<string, Map<string, any[]>>();

    activeSessions.forEach((session: any) => {
      const date = new Date(session?.startDate);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('default', { month: 'long' });

      if (!yearGroups.has(year)) {
        yearGroups.set(year, new Map());
      }
      if (!yearGroups.get(year)!.has(month)) {
        yearGroups.get(year)!.set(month, []);
      }
      yearGroups.get(year)!.get(month)!.push(session);
    });

    return Array.from(yearGroups.entries())
      .map(([year, monthsMap]) => ({
        year,
        months: Array.from(monthsMap.entries())
          .map(([month, sessions]) => ({
            month,
            sessions: sessions.sort(
              (a: any, b: any) =>
                new Date(a.startDate).getTime() -
                new Date(b.startDate).getTime()
            ),
            monthDate: new Date(sessions[0].startDate),
          }))
          .sort((a, b) => a.monthDate.getTime() - b.monthDate.getTime())
          .map(({ month, sessions }) => ({
            month,
            sessions,
          })),
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  });

  // Expansion state management
  readonly expandedYears = signal<Set<string>>(new Set());

  readonly allExpanded = computed(() => {
    const expandedSet = this.expandedYears();
    const availableYears = this.groupedSessions().map((g) => g.year);
    return (
      availableYears.length > 0 &&
      availableYears.every((year) => expandedSet.has(year))
    );
  });

  toggleAll(): void {
    const shouldExpandAll = !this.allExpanded();
    const years = this.groupedSessions().map((g) => g.year);
    this.expandedYears.set(shouldExpandAll ? new Set(years) : new Set());
  }

  toggleYear(year: string): void {
    this.expandedYears.update((expanded) => {
      const newSet = new Set(expanded);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  }

  isYearExpanded(year: string): boolean {
    return this.expandedYears().has(year);
  }

  registerSession(session: any): void {
    this.router.navigate(['/register/premarital-register', session.id], {
      state: { selectedSessionId: session.id },
    });
  }
}
