import { Directive, EventEmitter, Output, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[appDoubleTap]',
  host: {
    '(touchstart)': 'onTouchStart($event)',
    '(touchend)': 'onTouchEnd($event)',
    '(dblclick)': 'onDoubleClick($event)'
  }
})
export class DoubleTapDirective {
  @Output() doubleTap = new EventEmitter<Event>();

  private document = inject(DOCUMENT);
  private lastTap = signal(0);
  private tapCount = signal(0);
  private doubleTapDelay = 300;
  private minTapDelay = 50; // Minimum time between taps to prevent accidental rapid taps
  private timeoutId: number | null = null;

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length > 1) {
      this.resetTap();
      return;
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length > 1) {
      this.resetTap();
      return;
    }

    // Always prevent default to stop zoom behavior
    event.preventDefault();

    const currentTime = new Date().getTime();
    const tapLength = currentTime - this.lastTap();

    // Clear any existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Check if tap is within valid timing window
    if (tapLength < this.doubleTapDelay && tapLength > this.minTapDelay) {
      this.tapCount.update(count => count + 1);
      
      if (this.tapCount() === 2) {
        this.doubleTap.emit(event);
        this.resetTap();
        return;
      }
    } else if (tapLength <= this.minTapDelay && this.tapCount() > 0) {
      // Too fast, ignore this tap
      return;
    } else {
      this.tapCount.set(1);
    }

    this.lastTap.set(currentTime);

    // Set timeout to reset if no second tap comes
    this.timeoutId = setTimeout(() => {
      this.resetTap();
    }, this.doubleTapDelay);
  }

  onDoubleClick(event: MouseEvent): void {
    if (!this.isTouchDevice()) {
      this.doubleTap.emit(event);
    }
  }

  private resetTap(): void {
    this.tapCount.set(0);
    this.lastTap.set(0);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private isTouchDevice(): boolean {
    return 'ontouchstart' in (this.document.defaultView || window) ||
           navigator.maxTouchPoints > 0;
  }
}