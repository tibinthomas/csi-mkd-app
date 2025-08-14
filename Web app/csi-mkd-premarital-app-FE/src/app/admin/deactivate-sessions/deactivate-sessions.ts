import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { CsiMkdPremaritalAppBeService } from '../../../api/services';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-deactivate-sessions',
  imports: [MatButtonModule],
  templateUrl: './deactivate-sessions.html',
  styleUrl: './deactivate-sessions.scss',
})
export class DeactivateSessions {
  private service = inject(CsiMkdPremaritalAppBeService);

  // Signals for "3 Days" deactivation
  loadingDeactivateUpcoming = signal(false);
  messageDeactivateUpcoming = signal('');
  successDeactivateUpcoming = signal(false);

  // Signals for "Past Sessions" deactivation
  loadingDeactivatePast = signal(false);
  messageDeactivatePast = signal('');
  successDeactivatePast = signal(false);

  confirmDeactivateUpcoming() {
    const confirmed = window.confirm(
      'Are you sure you want to deactivate all sessions scheduled for today and the next 3 days?'
    );
    if (confirmed) {
      this.deactivateUpcomingSessions();
    }
  }

  confirmDeactivatePast() {
    const confirmed = window.confirm(
      'Are you sure you want to deactivate all past sessions?'
    );
    if (confirmed) {
      this.deactivatePastSessions();
    }
  }

  deactivateUpcomingSessions() {
    this.loadingDeactivateUpcoming.set(true);
    this.messageDeactivateUpcoming.set('');
    this.service.apiSessionconfigDeactivateSessionsPost().subscribe({
      next: () => {
        this.successDeactivateUpcoming.set(true);
        this.messageDeactivateUpcoming.set(
          'All active sessions scheduled to start today or within the next 3 days have been successfully deactivated'
        );
      },
      error: () => {
        this.successDeactivateUpcoming.set(false);
        this.messageDeactivateUpcoming.set(
          'Failed to deactivate sessions starting in 3 days.'
        );
      },
      complete: () => this.loadingDeactivateUpcoming.set(false),
    });
  }

  deactivatePastSessions() {
    this.loadingDeactivatePast.set(true);
    this.messageDeactivatePast.set('');
    this.service.apiSessionconfigDeactivatePastSessionsPost().subscribe({
      next: () => {
        this.successDeactivatePast.set(true);
        this.messageDeactivatePast.set(
          'All past sessions have been deactivated successfully.'
        );
      },
      error: () => {
        this.successDeactivatePast.set(false);
        this.messageDeactivatePast.set('Failed to deactivate past sessions.');
      },
      complete: () => this.loadingDeactivatePast.set(false),
    });
  }
}
