import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

type CachedEntry = {
  etag: string;
  response: HttpResponse<any>;
  savedAtMs: number;
};

@Injectable()
export class EtagCacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, CachedEntry>();

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Only consider safe, idempotent GET requests
    const isGet = req.method.toUpperCase() === 'GET';

    // Allow explicit opt-out
    const skip =
      req.headers.has('X-Skip-Interceptor') || req.headers.has('X-ETag-Bypass');
    if (!isGet || skip) {
      return next.handle(this.stripBypassHeaders(req));
    }

    const cacheKey = this.buildCacheKey(req);
    const cached = this.cache.get(cacheKey);

    const startedAt = performance.now();

    const revalidatedReq = cached
      ? req.clone({ headers: req.headers.set('If-None-Match', cached.etag) })
      : req;

    return next.handle(revalidatedReq).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // If server says Not Modified, return cached body
          if (event.status === 304 && cached) {
            this.logPerf('cache-304', req, startedAt);
            return cached.response.clone();
          }

          // On normal 2xx response, store/update cache if ETag present
          const etag = event.headers.get('ETag') || event.headers.get('etag');
          if (etag) {
            this.cache.set(cacheKey, {
              etag,
              response: event.clone(),
              savedAtMs: Date.now(),
            });
          }
          this.logPerf(`network-${event.status}`, req, startedAt);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        // 304 can sometimes surface as an error depending on transport; attempt to serve cache
        if (error.status === 304 && cached) {
          this.logPerf('cache-304-errorpath', req, startedAt);
          return of(cached.response.clone());
        }
        return throwError(() => error);
      })
    );
  }

  private buildCacheKey(req: HttpRequest<any>): string {
    // urlWithParams contains URL + serialized params; also include Accept header which can affect representation
    const accept = req.headers.get('Accept') || '';
    return `${req.method}|${req.urlWithParams}|accept:${accept}`;
  }

  private logPerf(
    kind: string,
    req: HttpRequest<any>,
    startedAt: number
  ): void {
    const elapsed = Math.round(performance.now() - startedAt);
    // Minimal console metrics; could be replaced by a real metrics service later
    // eslint-disable-next-line no-console
    console.debug(`[ETag] ${kind} ${elapsed}ms -> ${req.urlWithParams}`);
  }

  private stripBypassHeaders(req: HttpRequest<any>): HttpRequest<any> {
    let headers = req.headers;
    if (headers.has('X-Skip-Interceptor')) {
      headers = headers.delete('X-Skip-Interceptor');
    }
    if (headers.has('X-ETag-Bypass')) {
      headers = headers.delete('X-ETag-Bypass');
    }
    return req.clone({ headers });
  }
}
