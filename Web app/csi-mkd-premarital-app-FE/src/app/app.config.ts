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
// import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { ApiConfiguration } from '../api/api-configuration';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './core/auth/token.interceptor';
import { RateLimitInterceptor } from './core/interceptors/rate-limit-interceptor';
import { EtagCacheInterceptor } from './core/interceptors/etag-cache.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { ThemeService } from './core/services/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RateLimitInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: EtagCacheInterceptor,
      multi: true,
    },
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
    // { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    // AuthGuard,
  ],
};
