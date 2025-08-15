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

import { ApiConfiguration } from '../api/api-configuration';
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
      const apiConfig: ApiConfiguration = inject(ApiConfiguration);
      apiConfig.rootUrl = API_ROOT_URL;
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
  ],
};
