import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  private readonly swUpdate = inject(SwUpdate);

  readonly updateAvailable = signal(false);
  readonly isUpdating = signal(false);

  private readonly STORAGE_KEY = 'app-update-notification';
  private readonly CHANNEL_NAME = 'app-update-channel';
  private readonly VERSION_CHECK_KEY = 'app-version-check';
  private broadcastChannel?: BroadcastChannel;

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.initializeUpdateChecking();
      this.initializeBroadcastChannel();
    }
  }

  private initializeUpdateChecking(): void {
    // Check for updates when the service worker detects a new version
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe(() => {
        this.updateAvailable.set(true);
        this.notifyOtherTabs();
      });

    // Check for updates more frequently - every 30 minutes
    setInterval(() => {
      this.checkForUpdate();
    }, 30 * 60 * 1000); // 30 minutes interval

    // Check for updates when the app becomes visible (user switches back to tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdate();
      }
    });

    // Check for updates when the app comes back online
    window.addEventListener('online', () => {
      this.checkForUpdate();
    });

    // Check for updates when the window regains focus
    window.addEventListener('focus', () => {
      this.checkForUpdate();
    });

    // Initial check after 10 seconds to allow app to fully load
    setTimeout(() => {
      this.checkForUpdate();
      this.checkVersionStaleness();
    }, 10000);
  }

  private initializeBroadcastChannel(): void {
    if ('BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(this.CHANNEL_NAME);

      this.broadcastChannel.addEventListener('message', (event) => {
        if (event.data.type === 'UPDATE_AVAILABLE') {
          this.updateAvailable.set(true);
        } else if (event.data.type === 'UPDATE_APPLIED') {
          window.location.reload();
        }
      });
    }
  }

  private notifyOtherTabs(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'UPDATE_AVAILABLE' });
    }

    localStorage.setItem(this.STORAGE_KEY, Date.now().toString());

    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY && event.newValue) {
        this.updateAvailable.set(true);
      }
    });
  }

  async checkForUpdate(): Promise<void> {
    if (this.swUpdate.isEnabled && !this.isUpdating()) {
      try {
        const updateFound = await this.swUpdate.checkForUpdate();
        if (updateFound) {
          this.updateAvailable.set(true);
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }
  }

  async applyUpdate(): Promise<void> {
    if (!this.swUpdate.isEnabled || this.isUpdating()) {
      return;
    }

    this.isUpdating.set(true);

    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'UPDATE_APPLIED' });
      }

      // Clear all caches before applying update
      await this.clearAllCaches();

      await this.swUpdate.activateUpdate();

      // Force reload with cache busting
      this.forceReloadWithCacheBusting();
    } catch (error) {
      console.error('Error applying update:', error);
      // Even if update fails, try to clear cache and reload
      await this.clearAllCaches();
      this.forceReloadWithCacheBusting();
    }
  }

  dismissUpdate(): void {
    this.updateAvailable.set(false);
  }

  private async clearAllCaches(): Promise<void> {
    try {
      // Clear all browser caches (most important for Safari)
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );

      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

    } catch (error) {
      console.warn('Failed to clear some caches:', error);
    }
  }

  private forceReloadWithCacheBusting(): void {
    // Multiple cache-busting strategies for maximum effectiveness
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    
    // Method 1: Add timestamp and random ID to URL
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('v', timestamp.toString());
    currentUrl.searchParams.set('r', randomId);
    
    // Method 2: Force full page reload bypassing cache
    try {
      // Try location.replace first (no browser history)
      window.location.replace(currentUrl.toString());
    } catch (error) {
      // Fallback to location.href
      window.location.href = currentUrl.toString();
    }
  }

  // Emergency cache clear method (can be called manually)
  async forceClearAndReload(): Promise<void> {
    await this.clearAllCaches();
    
    // Additional aggressive cache clearing for stubborn browsers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      } catch (error) {
        console.warn('Failed to unregister service workers:', error);
      }
    }
    
    this.forceReloadWithCacheBusting();
  }

  // Method to manually check for updates and clear cache if needed
  async manualUpdateCheck(): Promise<boolean> {
    try {
      const updateAvailable = await this.swUpdate.checkForUpdate();
      if (!updateAvailable) {
        // Even if no update, clear cache if requested
        const clearCache = confirm('No updates available. Would you like to clear cache and reload anyway?');
        if (clearCache) {
          await this.forceClearAndReload();
        }
      }
      return updateAvailable;
    } catch (error) {
      console.error('Manual update check failed:', error);
      return false;
    }
  }

  private checkVersionStaleness(): void {
    const now = Date.now();
    const lastCheck = localStorage.getItem(this.VERSION_CHECK_KEY);
    
    // Store current time for version checking
    localStorage.setItem(this.VERSION_CHECK_KEY, now.toString());
    
    if (lastCheck) {
      const timeSinceLastCheck = now - parseInt(lastCheck);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      // If app hasn't been updated in 24 hours, force check
      if (timeSinceLastCheck > maxAge) {
        this.checkForUpdate();
        
        // After 48 hours without update, be more aggressive
        if (timeSinceLastCheck > 2 * maxAge) {
          setTimeout(() => {
            if (!this.updateAvailable()) {
              const forceRefresh = confirm(
                'The app hasn\'t been updated in a while. Would you like to refresh to ensure you have the latest version?'
              );
              if (forceRefresh) {
                this.forceClearAndReload();
              }
            }
          }, 5000);
        }
      }
    }
  }

  // Get app version info (useful for debugging)
  getVersionInfo(): { lastCheck: string | null, currentTime: string } {
    return {
      lastCheck: localStorage.getItem(this.VERSION_CHECK_KEY),
      currentTime: Date.now().toString()
    };
  }
}
