import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { SessionConfigService } from '../../../api/services';
import { CreateUpdateSessionDto } from '../../../api/models';

@Injectable({
  providedIn: 'root',
})
export class SessionDataService {
  private readonly sessionConfigService = inject(SessionConfigService);

  private readonly refreshTrigger = new BehaviorSubject<void>(undefined);

  readonly sessions$: Observable<CreateUpdateSessionDto[]> =
    this.refreshTrigger.pipe(
      switchMap(() =>
        this.sessionConfigService.apiSessionconfigGet().pipe(
          map((data: any) => {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            return (parsed || []).sort((a: any, b: any) => b.Id - a.Id);
          }),
          catchError((err) => {
            console.error('Failed to load sessions:', err);
            // Depending on requirements, you might want to show a user-facing error.
            return of([]); // Fallback to an empty array on error.
          })
        )
      ),
      shareReplay(1) // Cache the latest list of sessions.
    );

  /**
   * Call this method to trigger a refresh of the session data.
   */
  refresh(): void {
    this.refreshTrigger.next();
  }
}
