import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  private readonly swUpdate = inject(SwUpdate);
  
  readonly updateAvailable = signal(false);
  readonly isUpdating = signal(false);

  private readonly STORAGE_KEY = 'app-update-notification';
  private readonly CHANNEL_NAME = 'app-update-channel';
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
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        this.updateAvailable.set(true);
        this.notifyOtherTabs();
      });

    // Check for updates periodically (every 30 minutes)
    setInterval(() => {
      this.checkForUpdate();
    }, 30 * 60 * 1000);

    // Check for updates when the app becomes visible (user switches back to tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdate();
      }
    });
  }

  private initializeBroadcastChannel(): void {
    if ('BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(this.CHANNEL_NAME);
      
      this.broadcastChannel.addEventListener('message', (event) => {
        if (event.data.type === 'UPDATE_AVAILABLE') {
          this.updateAvailable.set(true);
        } else if (event.data.type === 'UPDATE_APPLIED') {
          // Another tab applied the update, refresh this tab
          window.location.reload();
        }
      });
    }
  }

  private notifyOtherTabs(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'UPDATE_AVAILABLE' });
    }
    
    // Fallback using localStorage for older browsers
    localStorage.setItem(this.STORAGE_KEY, Date.now().toString());
    
    // Listen for storage changes (for cross-tab communication)
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
      // Notify other tabs that update is being applied
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'UPDATE_APPLIED' });
      }
      
      // Apply the update
      await this.swUpdate.activateUpdate();
      
      // Reload the page to use the new version
      window.location.reload();
    } catch (error) {
      console.error('Error applying update:', error);
      this.isUpdating.set(false);
    }
  }

  dismissUpdate(): void {
    this.updateAvailable.set(false);
  }
}