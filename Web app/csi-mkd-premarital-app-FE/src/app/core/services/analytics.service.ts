import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

enum SeverityLevel {
  Verbose = 0,
  Information = 1,
  Warning = 2,
  Error = 3,
  Critical = 4,
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private appInsights: ApplicationInsights | null = null;
  private consentGiven = false;

  constructor() {
    this.checkConsent();
    this.initializeAppInsights();
  }

  private initializeAppInsights(): void {
    try {
      this.appInsights = new ApplicationInsights({
        config: {
          connectionString: (globalThis as any).APPLICATION_INSIGHTS_CONNECTION_STRING || '',
          enableAutoRouteTracking: true,
          enableCorsCorrelation: true,
          enableRequestHeaderTracking: true,
          enableResponseHeaderTracking: true,
          enableAjaxErrorStatusText: true,
          enableUnhandledPromiseRejectionTracking: true,
          disableFetchTracking: false,
          enableAjaxPerfTracking: true,
        },
      });

      const connectionString = (globalThis as any).APPLICATION_INSIGHTS_CONNECTION_STRING;
      if (connectionString && this.appInsights) {
        this.appInsights.loadAppInsights();
        this.appInsights.addTelemetryInitializer((envelope: any) => {
          envelope.tags = envelope.tags || {};
          envelope.tags['ai.cloud.role'] = 'csi-mkd-premarital-frontend';
          envelope.tags['ai.application.ver'] = '1.0.0';
        });
      }
    } catch (error) {
      console.warn('Application Insights not available:', error);
      this.appInsights = null;
    }
  }

  /**
   * Check user consent status
   */
  private checkConsent(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const consent = localStorage.getItem('csi-analytics-consent');
        this.consentGiven = consent === 'true';
      } catch (error) {
        console.warn('Failed to check analytics consent:', error);
        this.consentGiven = false;
      }
    }
  }

  /**
   * Set user consent for analytics
   */
  setConsentStatus(consent: boolean): void {
    this.consentGiven = consent;
  }

  /**
   * Track custom events (only if consent given)
   */
  trackEvent(
    name: string,
    properties?: { [key: string]: any },
    measurements?: { [key: string]: number }
  ): void {
    if (
      this.consentGiven &&
      this.appInsights &&
(globalThis as any).APPLICATION_INSIGHTS_CONNECTION_STRING
    ) {
      this.appInsights.trackEvent({ 
        name, 
        properties, 
        measurements 
      });
    }
  }

  /**
   * Track page views (only if consent given)
   */
  trackPageView(name?: string, properties?: { [key: string]: any }): void {
    if (
      this.consentGiven &&
      this.appInsights &&
(globalThis as any).APPLICATION_INSIGHTS_CONNECTION_STRING
    ) {
      if (name || properties) {
        this.appInsights.trackPageView({ 
          name, 
          properties 
        });
      } else {
        this.appInsights.trackPageView();
      }
    }
  }

  /**
   * Track exceptions (only if consent given)
   */
  trackException(error: Error, properties?: { [key: string]: any }): void {
    if (
      this.consentGiven &&
      this.appInsights &&
(globalThis as any).APPLICATION_INSIGHTS_CONNECTION_STRING
    ) {
      this.appInsights.trackException(
        {
          exception: error,
          severityLevel: SeverityLevel.Error,
        },
        properties
      );
    }
  }

  /**
   * Track theme changes
   */
  trackThemeChange(theme: string, previousTheme?: string): void {
    this.trackEvent('Theme Changed', {
      newTheme: theme,
      previousTheme: previousTheme || 'unknown',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track language changes
   */
  trackLanguageChange(language: string, previousLanguage?: string): void {
    this.trackEvent('Language Changed', {
      newLanguage: language,
      previousLanguage: previousLanguage || 'unknown',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track user interactions
   */
  trackUserInteraction(
    action: string,
    element: string,
    properties?: { [key: string]: any }
  ): void {
    this.trackEvent('User Interaction', {
      action,
      element,
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track custom metrics
   */
  trackMetric(
    name: string,
    value: number,
    properties?: { [key: string]: any }
  ): void {
    if (this.appInsights && (globalThis as any).APPLICATION_INSIGHTS_CONNECTION_STRING) {
      this.appInsights.trackMetric({ name, average: value }, properties);
    }
  }

  /**
   * Set user context
   */
  setUser(userId: string, properties?: { [key: string]: any }): void {
    if (this.appInsights && (globalThis as any).APPLICATION_INSIGHTS_CONNECTION_STRING) {
      this.appInsights.setAuthenticatedUserContext(userId, undefined, true);
      if (properties) {
        Object.keys(properties).forEach((key) => {
          this.appInsights!.addTelemetryInitializer((envelope: any) => {
            envelope.tags = envelope.tags || {};
            envelope.tags[`ai.user.${key}`] = properties[key];
          });
        });
      }
    }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (this.appInsights && (globalThis as any).APPLICATION_INSIGHTS_CONNECTION_STRING) {
      this.appInsights.clearAuthenticatedUserContext();
    }
  }

  /**
   * Flush telemetry (force send)
   */
  flush(): void {
    if (this.appInsights && (globalThis as any).APPLICATION_INSIGHTS_CONNECTION_STRING) {
      this.appInsights.flush();
    }
  }
}
