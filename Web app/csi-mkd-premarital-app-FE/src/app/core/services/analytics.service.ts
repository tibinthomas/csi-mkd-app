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

  constructor() {
    this.initializeAppInsights();
  }

  private initializeAppInsights(): void {
    try {
      const connectionString = APPLICATION_INSIGHTS_CONNECTION_STRING;

      if (!connectionString) {
        console.error(
          'Application Insights initialization failed: Connection string is not configured or empty'
        );
        this.appInsights = null;
        return;
      }

      this.appInsights = new ApplicationInsights({
        config: {
          connectionString: connectionString,
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

      this.appInsights.loadAppInsights();
      this.appInsights.addTelemetryInitializer((envelope: any) => {
        envelope.tags = envelope.tags || {};
        envelope.tags['ai.cloud.role'] = 'csi-mkd-premarital-frontend';
        envelope.tags['ai.application.ver'] = '1.0.0';
      });

      // Add connection monitoring
      this.monitorAppInsightsConnection();
    } catch (error) {
      console.error('Application Insights initialization failed:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        connectionString: APPLICATION_INSIGHTS_CONNECTION_STRING
          ? 'Present'
          : 'Missing',
      });
      this.appInsights = null;
    }
  }

  private monitorAppInsightsConnection(): void {
    if (!this.appInsights) return;

    // Monitor telemetry pipeline for connection issues
    this.appInsights.addTelemetryInitializer((envelope: any) => {
      if (!envelope) {
        console.error(
          'Application Insights: Telemetry envelope is null or undefined'
        );
        return false;
      }
      return true;
    });

    // Set up error handling for failed telemetry sends
    setTimeout(() => {
      try {
        // Test connection by sending a minimal telemetry item
        this.appInsights?.trackEvent({
          name: 'AppInsights Connection Test',
          properties: { timestamp: new Date().toISOString() },
        });
      } catch (error) {
        console.error('Application Insights connection test failed:', {
          error: error,
          message:
            error instanceof Error ? error.message : 'Connection test error',
        });
      }
    }, 1000);
  }

  /**
   * Track custom events
   */
  trackEvent(
    name: string,
    properties?: { [key: string]: any },
    measurements?: { [key: string]: number }
  ): void {
    if (this.appInsights && APPLICATION_INSIGHTS_CONNECTION_STRING) {
      try {
        this.appInsights.trackEvent({
          name,
          properties,
          measurements,
        });
      } catch (error) {
        console.error('Application Insights trackEvent failed:', {
          eventName: name,
          error: error,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else if (!this.appInsights) {
      console.error(
        'Application Insights trackEvent failed: Service not initialized'
      );
    }
  }

  /**
   * Track page views
   */
  trackPageView(name?: string, properties?: { [key: string]: any }): void {
    if (this.appInsights && APPLICATION_INSIGHTS_CONNECTION_STRING) {
      try {
        if (name || properties) {
          this.appInsights.trackPageView({
            name,
            properties,
          });
        } else {
          this.appInsights.trackPageView();
        }
      } catch (error) {
        console.error('Application Insights trackPageView failed:', {
          pageName: name,
          error: error,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else if (!this.appInsights) {
      console.error(
        'Application Insights trackPageView failed: Service not initialized'
      );
    }
  }

  /**
   * Track exceptions
   */
  trackException(error: Error, properties?: { [key: string]: any }): void {
    if (this.appInsights && APPLICATION_INSIGHTS_CONNECTION_STRING) {
      try {
        this.appInsights.trackException(
          {
            exception: error,
            severityLevel: SeverityLevel.Error,
          },
          properties
        );
      } catch (trackingError) {
        console.error('Application Insights trackException failed:', {
          originalError: error.message,
          trackingError: trackingError,
          message:
            trackingError instanceof Error
              ? trackingError.message
              : 'Unknown error',
        });
      }
    } else if (!this.appInsights) {
      console.error(
        'Application Insights trackException failed: Service not initialized - Original error:',
        error.message
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
    if (this.appInsights && APPLICATION_INSIGHTS_CONNECTION_STRING) {
      try {
        this.appInsights.trackMetric({ name, average: value }, properties);
      } catch (error) {
        console.error('Application Insights trackMetric failed:', {
          metricName: name,
          metricValue: value,
          error: error,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else if (!this.appInsights) {
      console.error(
        'Application Insights trackMetric failed: Service not initialized'
      );
    }
  }

  /**
   * Set user context
   */
  setUser(userId: string, properties?: { [key: string]: any }): void {
    if (this.appInsights && APPLICATION_INSIGHTS_CONNECTION_STRING) {
      try {
        this.appInsights.setAuthenticatedUserContext(userId, undefined, true);
        if (properties) {
          Object.keys(properties).forEach((key) => {
            this.appInsights!.addTelemetryInitializer((envelope: any) => {
              envelope.tags = envelope.tags || {};
              envelope.tags[`ai.user.${key}`] = properties[key];
            });
          });
        }
      } catch (error) {
        console.error('Application Insights setUser failed:', {
          userId: userId,
          error: error,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else if (!this.appInsights) {
      console.error(
        'Application Insights setUser failed: Service not initialized'
      );
    }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (this.appInsights && APPLICATION_INSIGHTS_CONNECTION_STRING) {
      try {
        this.appInsights.clearAuthenticatedUserContext();
      } catch (error) {
        console.error('Application Insights clearUser failed:', {
          error: error,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else if (!this.appInsights) {
      console.error(
        'Application Insights clearUser failed: Service not initialized'
      );
    }
  }

  /**
   * Flush telemetry (force send)
   */
  flush(): void {
    if (this.appInsights && APPLICATION_INSIGHTS_CONNECTION_STRING) {
      try {
        this.appInsights.flush();
      } catch (error) {
        console.error('Application Insights flush failed:', {
          error: error,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else if (!this.appInsights) {
      console.error(
        'Application Insights flush failed: Service not initialized'
      );
    }
  }
}
