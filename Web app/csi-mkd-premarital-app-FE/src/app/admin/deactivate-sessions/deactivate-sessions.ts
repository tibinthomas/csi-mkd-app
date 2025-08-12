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
  private csiMkdPremaritalAppBeService = inject(CsiMkdPremaritalAppBeService);

  loading = signal(false);
  message = signal('');
  success = signal(true);

  deactivateSessions() {
    this.loading.set(true);
    this.message.set('');

    this.csiMkdPremaritalAppBeService
      .apiSessionconfigDeactivateSessionsPost()
      .subscribe({
        next: () => {
          this.message.set('Sessions deactivated successfully.');
          this.success.set(true);
          this.loading.set(false);
        },
        error: () => {
          this.message.set('Failed to deactivate sessions. Try again later.');
          this.success.set(false);
          this.loading.set(false);
        },
      });
  }
}
