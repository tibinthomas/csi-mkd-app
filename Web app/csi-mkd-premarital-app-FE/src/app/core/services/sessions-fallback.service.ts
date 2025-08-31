import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SessionsService as FunctionsSessionsService } from '../../../api/api-functions/services';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import { SessionConfigurationDto } from '../../../api/api-functions/models';
import { 
  SessionConfigurationDto as MainAppSessionConfigurationDto,
  CreateUpdateSessionDto
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

  private mapMainAppToFunctionsModel(session: MainAppSessionConfigurationDto): SessionConfigurationDto {
    return {
      ...session,
      sessionName: session.sessionName ?? undefined,
    };
  }

  getAllSessions(): Observable<Array<SessionConfigurationDto>> {
    return this.functionsSessionsService.getAllSessions().pipe(
      catchError((functionError) => {
        console.warn('Functions API failed, attempting fallback to main app API:', functionError);
        
        return this.mainAppService.apiSessionconfigGet().pipe(
          map((sessions) => sessions.map(session => this.mapMainAppToFunctionsModel(session))),
          catchError((mainAppError) => {
            console.error('Both APIs failed:', { functionError, mainAppError });
            return throwError(() => mainAppError);
          })
        );
      })
    );
  }

  getSessionsByYear(year: number): Observable<Array<SessionConfigurationDto>> {
    return this.functionsSessionsService.getSessionsByYear({ year }).pipe(
      catchError((functionError) => {
        console.warn('Functions API failed, attempting fallback to main app API:', functionError);
        
        return this.mainAppService.apiSessionconfigSessionsGet({ year }).pipe(
          map((sessions) => sessions.map(session => this.mapMainAppToFunctionsModel(session))),
          catchError((mainAppError) => {
            console.error('Both APIs failed:', { functionError, mainAppError });
            return throwError(() => mainAppError);
          })
        );
      })
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