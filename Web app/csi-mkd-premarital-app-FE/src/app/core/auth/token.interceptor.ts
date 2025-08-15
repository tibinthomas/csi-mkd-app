import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * HTTP interceptor that automatically adds authentication tokens to requests
 * and handles authentication errors.
 */
export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Skip token injection for requests with the skip header
  if (req.headers.has('X-Skip-Interceptor')) {
    return next(req.clone({
      headers: req.headers.delete('X-Skip-Interceptor'),
    }));
  }

  // Skip token injection for auth endpoints
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const token = authService.getToken();
  
  const authenticatedReq = token 
    ? req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      })
    : req;

  return next(authenticatedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle authentication errors
      if (error.status === 401 && authService.isLoggedIn()) {
        // Token has expired or is invalid
        authService.logout();
      }
      
      return throwError(() => error);
    })
  );
};

/**
 * Determines if the request URL is an authentication endpoint
 * that shouldn't include authorization headers.
 */
function isAuthEndpoint(url: string): boolean {
  const authPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
  return authPaths.some(path => url.includes(path));
}
