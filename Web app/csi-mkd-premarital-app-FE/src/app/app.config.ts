import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
// import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { ApiConfiguration } from '../api/api-configuration';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './core/auth/token.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideRouter(routes, withHashLocation()),
    provideAppInitializer(() => {
      const apiConfig: ApiConfiguration = inject(ApiConfiguration);
      apiConfig.rootUrl = API_ROOT_URL;
      return Promise.resolve();
    }),
    // { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    // AuthGuard,
  ],
};
