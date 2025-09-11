import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
import { AnalyticsService } from './analytics.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationAnalyticsService {
  private readonly router = inject(Router);
  private readonly analyticsService = inject(AnalyticsService);

  initialize(): void {
    // Track successful navigation events
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.url);
      });

    // Track route changes with previous route context
    this.router.events
      .pipe(
        filter(event => event instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe(([previous, current]: [RoutesRecognized, RoutesRecognized]) => {
        this.trackNavigation(previous.url, current.url);
      });
  }

  private trackPageView(url: string): void {
    const routeName = this.getRouteNameFromUrl(url);
    const properties = {
      url,
      routeName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language
    };

    this.analyticsService.trackPageView(routeName, properties);
  }

  private trackNavigation(fromUrl: string, toUrl: string): void {
    const fromRoute = this.getRouteNameFromUrl(fromUrl);
    const toRoute = this.getRouteNameFromUrl(toUrl);

    this.analyticsService.trackEvent('Navigation', {
      fromRoute,
      toRoute,
      fromUrl,
      toUrl,
      timestamp: new Date().toISOString()
    });
  }

  private getRouteNameFromUrl(url: string): string {
    // Remove hash and query parameters
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // Map URLs to readable route names
    const routeMap: { [key: string]: string } = {
      '/': 'Home',
      '/register': 'Registration Selection',
      '/register/premarital': 'Premarital Registration',
      '/register/general': 'General Registration',
      '/register/pre-confirm': 'Pre-Confirmation Registration',
      '/admin': 'Admin Home',
      '/admin/login': 'Admin Login',
      '/admin/dashboard': 'Admin Dashboard',
      '/admin/premarital': 'Admin Premarital List',
      '/admin/general': 'Admin General List',
      '/admin/pre-confirm': 'Admin Pre-Confirmation List',
      '/admin/session-config': 'Session Configuration',
      '/admin/instructors': 'Instructors Management',
      '/admin/feedback': 'Feedback Management',
      '/admin/deactivate-sessions': 'Deactivate Sessions'
    };

    return routeMap[cleanUrl] || cleanUrl || 'Unknown Route';
  }
}