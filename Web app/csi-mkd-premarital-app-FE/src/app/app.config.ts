import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  isDevMode,
} from '@angular/core';
import {
  provideRouter,
  withHashLocation,
  withViewTransitions,
  withInMemoryScrolling,
  withComponentInputBinding,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { ApiConfiguration as MainAppApiConfig } from '../api/api-main-app/api-configuration';
import { ApiConfiguration as FunctionAppApiConfig } from '../api/api-functions/api-configuration';
import { routes } from './app.routes';
import { tokenInterceptor } from './core/auth/token.interceptor';
import { ThemeService } from './core/services/theme.service';
import { rateLimitInterceptor } from './core/interceptors/rate-limit-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(
      withInterceptors([tokenInterceptor, rateLimitInterceptor])
    ),
    provideRouter(
      routes,
      withHashLocation(),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withComponentInputBinding()
    ),
    provideAppInitializer(() => {
      const apiConfigMainApp: MainAppApiConfig = inject(MainAppApiConfig);
      const apiConfigFunctionApp: FunctionAppApiConfig =
        inject(FunctionAppApiConfig);
      apiConfigMainApp.rootUrl = API_ROOT_URL_MAIN_APP;
      apiConfigFunctionApp.rootUrl = API_ROOT_URL_FN_APP;
      return Promise.resolve();
    }),
    provideAppInitializer(() => {
      // Initialize theme service to ensure proper theme application on app start
      inject(ThemeService);
      return Promise.resolve();
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'DD/MM/YYYY',
        },
        display: {
          dateInput: 'DD/MM/YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ],
};
