import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, timer, of } from 'rxjs';
import { catchError, retry, retryWhen, delayWhen, take, concat } from 'rxjs/operators';

interface RateLimitConfig {
  readonly maxRetries: number;
  readonly retryDelay: number; // milliseconds
  readonly backoffMultiplier: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2,
};

/**
 * HTTP interceptor that handles rate limiting errors (429) with exponential backoff retry.
 * Provides user-friendly notifications and automatic retry mechanisms.
 */
export const rateLimitInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  return next(req).pipe(
    retryWhen(errors => 
      errors.pipe(
        delayWhen((error: HttpErrorResponse, retryIndex) => {
          if (error.status === 429 && retryIndex < DEFAULT_CONFIG.maxRetries) {
            const delay = calculateRetryDelay(retryIndex);
            return timer(delay);
          }
          // Re-throw error if not 429 or max retries exceeded
          return throwError(() => error);
        }),
        take(DEFAULT_CONFIG.maxRetries)
      )
    ),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 429) {
        handleRateLimitError(error, req);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Calculates retry delay with exponential backoff.
 */
function calculateRetryDelay(retryIndex: number): number {
  return DEFAULT_CONFIG.retryDelay * Math.pow(DEFAULT_CONFIG.backoffMultiplier, retryIndex);
}

/**
 * Handles rate limit errors by showing user-friendly notifications.
 */
function handleRateLimitError(error: HttpErrorResponse, req: HttpRequest<unknown>): void {
  const retryAfter = error.headers.get('Retry-After');
  const waitTime = retryAfter ? `${retryAfter} seconds` : 'a moment';
  
  // Extract rate limit details from headers if available
  const remaining = error.headers.get('X-RateLimit-Remaining');
  const resetTime = error.headers.get('X-RateLimit-Reset');
  
  let message = `Rate limit exceeded. Please wait ${waitTime} before trying again.`;
  
  if (remaining === '0' && resetTime) {
    const resetDate = new Date(parseInt(resetTime) * 1000);
    const resetTimeStr = resetDate.toLocaleTimeString();
    message = `Rate limit exceeded. Limit resets at ${resetTimeStr}.`;
  }

  // Log for debugging
  console.warn(`[RateLimit] ${req.method} ${req.url} - ${message}`, {
    retryAfter,
    remaining,
    resetTime,
    error: error.error
  });

  // Show user notification (could be replaced with a toast service)
  if (typeof window !== 'undefined' && window.alert) {
    window.alert(message);
  }
}

