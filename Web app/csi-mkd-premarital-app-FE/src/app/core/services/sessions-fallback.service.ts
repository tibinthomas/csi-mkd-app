import { Injectable, inject } from '@angular/core';
import { Observable, throwError, timer, EMPTY } from 'rxjs';
import { catchError, map, timeout, tap, finalize } from 'rxjs/operators';
import { SessionsService as FunctionsSessionsService } from '../../../api/api-functions/services';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import { SessionConfigurationDto } from '../../../api/api-functions/models';
import { 
  SessionConfigurationDto as MainAppSessionConfigurationDto
} from '../../../api/api-main-app/models';
import { ApiSessionconfigSessionsGet$Params } from '../../../api/api-main-app/fn/csi-mkd-premarital-app-be/api-sessionconfig-sessions-get';
import { ApiSessionconfigPost$Params } from '../../../api/api-main-app/fn/csi-mkd-premarital-app-be/api-sessionconfig-post';
import { ApiSessionconfigIdGet$Params } from '../../../api/api-main-app/fn/csi-mkd-premarital-app-be/api-sessionconfig-id-get';
import { ApiSessionconfigIdPut$Params } from '../../../api/api-main-app/fn/csi-mkd-premarital-app-be/api-sessionconfig-id-put';
import { ApiSessionconfigIdDelete$Params } from '../../../api/api-main-app/fn/csi-mkd-premarital-app-be/api-sessionconfig-id-delete';
import { ApiSessionconfigDeactivateSessionsPost$Params } from '../../../api/api-main-app/fn/csi-mkd-premarital-app-be/api-sessionconfig-deactivate-sessions-post';
import { ApiSessionconfigDeactivatePastSessionsPost$Params } from '../../../api/api-main-app/fn/csi-mkd-premarital-app-be/api-sessionconfig-deactivate-past-sessions-post';

@Injectable({
  providedIn: 'root',
})
export class SessionsFallbackService {
  private readonly functionsSessionsService = inject(FunctionsSessionsService);
  private readonly mainAppService = inject(CsiMkdPremaritalAppBeService);

  private readonly FUNCTION_TIMEOUT_MS = 10000; // 10 seconds
  private readonly WARMUP_DELAY_MS = 5000; // 5 seconds

  private mapMainAppToFunctionsModel(session: MainAppSessionConfigurationDto): SessionConfigurationDto {
    return {
      ...session,
      sessionName: session.sessionName ?? undefined,
    };
  }

  private warmupMainApp(): void {
    // Trigger a lightweight health check to warm up the container
    this.mainAppService.healthGet().pipe(
      catchError(() => EMPTY) // Ignore errors, this is just for warmup
    ).subscribe();
  }

  private withTimeoutAndWarmup<T>(
    functionsCall: Observable<T>,
    fallbackCall: Observable<T>
  ): Observable<T> {
    let warmupTriggered = false;
    
    // Setup warmup timer that only triggers if request is still pending
    const warmupTimer = timer(this.WARMUP_DELAY_MS).pipe(
      tap(() => {
        if (!warmupTriggered) {
          warmupTriggered = true;
          console.log('Functions API taking longer than 5s, warming up main app...');
          this.warmupMainApp();
        }
      })
    ).subscribe();

    return functionsCall.pipe(
      timeout(this.FUNCTION_TIMEOUT_MS),
      finalize(() => {
        warmupTriggered = true; // Prevent warmup if request completes
        warmupTimer.unsubscribe();
      }),
      catchError((functionError) => {
        console.warn('Functions API failed (timeout or error), using main app API:', functionError);
        
        return fallbackCall.pipe(
          catchError((mainAppError) => {
            console.error('Both APIs failed:', { functionError, mainAppError });
            return throwError(() => mainAppError);
          })
        );
      })
    );
  }

  getAllSessions(): Observable<Array<SessionConfigurationDto>> {
    return this.withTimeoutAndWarmup(
      this.functionsSessionsService.getAllSessions(),
      this.mainAppService.apiSessionconfigGet().pipe(
        map((sessions) => sessions.map(session => this.mapMainAppToFunctionsModel(session)))
      )
    );
  }

  getSessionsByYear(year: number): Observable<Array<SessionConfigurationDto>> {
    return this.withTimeoutAndWarmup(
      this.functionsSessionsService.getSessionsByYear({ year }),
      this.mainAppService.apiSessionconfigSessionsGet({ year }).pipe(
        map((sessions) => sessions.map(session => this.mapMainAppToFunctionsModel(session)))
      )
    );
  }

  // Admin methods - these only use main app API as they're admin-specific operations
  apiSessionconfigSessionsGet(params: ApiSessionconfigSessionsGet$Params): Observable<Array<MainAppSessionConfigurationDto>> {
    return this.mainAppService.apiSessionconfigSessionsGet(params);
  }

  apiSessionconfigPost(params: ApiSessionconfigPost$Params): Observable<MainAppSessionConfigurationDto> {
    return this.mainAppService.apiSessionconfigPost(params);
  }

  apiSessionconfigIdGet(params: ApiSessionconfigIdGet$Params): Observable<MainAppSessionConfigurationDto> {
    return this.mainAppService.apiSessionconfigIdGet(params);
  }

  apiSessionconfigIdPut(params: ApiSessionconfigIdPut$Params): Observable<void> {
    return this.mainAppService.apiSessionconfigIdPut(params);
  }

  apiSessionconfigIdDelete(params: ApiSessionconfigIdDelete$Params): Observable<void> {
    return this.mainAppService.apiSessionconfigIdDelete(params);
  }

  apiSessionconfigDeactivateSessionsPost(params?: ApiSessionconfigDeactivateSessionsPost$Params): Observable<void> {
    return this.mainAppService.apiSessionconfigDeactivateSessionsPost(params);
  }

  apiSessionconfigDeactivatePastSessionsPost(params?: ApiSessionconfigDeactivatePastSessionsPost$Params): Observable<void> {
    return this.mainAppService.apiSessionconfigDeactivatePastSessionsPost(params);
  }
}