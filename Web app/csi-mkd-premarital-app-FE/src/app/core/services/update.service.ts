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

    // Check for updates periodically 4 times a day in equal interval
    setInterval(() => {
      this.checkForUpdate();
    }, 6 * 60 * 60 * 1000); // 6 hours interval

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

      await this.swUpdate.activateUpdate();

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
