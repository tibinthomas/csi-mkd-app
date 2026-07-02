import { Injectable, signal } from '@angular/core';

/**
 * Animation intensity tiers applied as `data-motion` on <html>:
 *  - 'full'  — every effect: aurora mesh, parallax, infinite floats, heavy blur
 *  - 'lite'  — one-shot entrance reveals only; ambient/infinite effects off, lighter blur
 *  - 'none'  — static UI (reduced-motion preference or very constrained device)
 */
export type MotionTier = 'full' | 'lite' | 'none';

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly _tier = signal<MotionTier>('full');
  readonly tier = this._tier.asReadonly();

  private readonly reducedMotionQuery = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  constructor() {
    this.applyTier(this.detectStaticTier());
    this.reducedMotionQuery.addEventListener('change', () =>
      this.applyTier(this.detectStaticTier())
    );

    // Static heuristics can overestimate a device; verify with a short
    // frame-rate probe once the browser is idle and demote if needed.
    if (this._tier() === 'full') {
      const start = () => this.probeFrameRate();
      if ('requestIdleCallback' in window) {
        requestIdleCallback(start, { timeout: 3000 });
      } else {
        setTimeout(start, 1500);
      }
    }
  }

  /** Capability heuristics available synchronously at startup. */
  private detectStaticTier(): MotionTier {
    if (this.reducedMotionQuery.matches) {
      return 'none';
    }

    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: NetworkInformationLike;
    };

    const cores = nav.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 4;
    const saveData = nav.connection?.saveData === true;
    const slowNetwork = /(^|-)2g$/.test(nav.connection?.effectiveType ?? '');

    if (saveData || slowNetwork || cores <= 2 || memory <= 2) {
      return 'lite';
    }
    // Mid/high-range devices start at 'full'; the FPS probe demotes if the
    // device can't actually sustain it.
    return 'full';
  }

  /**
   * Samples ~1s of animation frames while the page is animating.
   * Sustained low frame rates demote the tier to 'lite' so ambient effects
   * stop competing with content rendering. The probe never demotes to
   * 'none' — that tier is reserved for an explicit reduced-motion
   * preference, and a single noisy sample shouldn't strip all polish.
   */
  private probeFrameRate(): void {
    if (document.hidden) {
      return;
    }

    const sampleMs = 1000;
    let frames = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      frames++;
      if (now - startedAt < sampleMs) {
        requestAnimationFrame(tick);
        return;
      }
      const fps = (frames * 1000) / (now - startedAt);
      if (fps < 45 && this._tier() === 'full') {
        this.applyTier('lite');
      }
    };

    requestAnimationFrame(tick);
  }

  private applyTier(tier: MotionTier): void {
    this._tier.set(tier);
    document.documentElement.setAttribute('data-motion', tier);
  }
}
