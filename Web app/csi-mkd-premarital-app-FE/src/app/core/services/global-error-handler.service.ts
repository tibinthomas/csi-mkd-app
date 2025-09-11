import { ErrorHandler, Injectable, inject } from '@angular/core';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  private readonly analyticsService = inject(AnalyticsService);

  handleError(error: any): void {
    // Log to console for development
    console.error('Global error caught:', error);

    // Track the error with analytics
    let errorToTrack: Error;
    let additionalProperties: { [key: string]: any } = {};

    if (error instanceof Error) {
      errorToTrack = error;
    } else if (error?.rejection instanceof Error) {
      // Handle unhandled promise rejections
      errorToTrack = error.rejection;
      additionalProperties['errorType'] = 'unhandled_promise_rejection';
    } else if (error?.error instanceof Error) {
      // Handle HTTP errors
      errorToTrack = error.error;
      additionalProperties['errorType'] = 'http_error';
      additionalProperties['status'] = error.status;
      additionalProperties['statusText'] = error.statusText;
    } else {
      // Handle other types of errors
      errorToTrack = new Error(error?.message || 'Unknown error');
      additionalProperties['originalError'] = error;
      additionalProperties['errorType'] = 'unknown';
    }

    // Add context information
    additionalProperties['url'] = window.location.href;
    additionalProperties['userAgent'] = navigator.userAgent;
    additionalProperties['timestamp'] = new Date().toISOString();

    // Track the exception
    this.analyticsService.trackException(errorToTrack, additionalProperties);
  }
}