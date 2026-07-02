import {
  Directive,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { MotionService } from '../../core/services/motion.service';

/**
 * Subtle 3D pointer-tracking tilt for hero/feature surfaces.
 * Active only on the 'full' motion tier with a fine pointer; listeners are
 * attached natively and throttled to animation frames so the effect never
 * triggers change detection.
 */
@Directive({
  selector: '[appParallaxTilt]',
})
export class ParallaxTiltDirective {
  /** Maximum tilt in degrees. */
  readonly maxTilt = input<number>(4, { alias: 'appParallaxTilt' });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(MotionService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      if (
        this.motion.tier() !== 'full' ||
        !window.matchMedia('(pointer: fine)').matches
      ) {
        return;
      }

      const element = this.el.nativeElement;
      element.style.transformStyle = 'preserve-3d';
      element.style.willChange = 'transform';

      let frame = 0;
      let targetX = 0;
      let targetY = 0;

      const render = () => {
        frame = 0;
        element.style.transform = `perspective(900px) rotateX(${targetY}deg) rotateY(${targetX}deg)`;
      };

      const onMove = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        const max = this.maxTilt();
        targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2 * max;
        targetY = -((event.clientY - rect.top) / rect.height - 0.5) * 2 * max;
        frame ||= requestAnimationFrame(render);
      };

      const onLeave = () => {
        if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
        element.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        element.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        setTimeout(() => (element.style.transition = ''), 600);
      };

      element.addEventListener('pointermove', onMove, { passive: true });
      element.addEventListener('pointerleave', onLeave, { passive: true });
      this.destroyRef.onDestroy(() => {
        element.removeEventListener('pointermove', onMove);
        element.removeEventListener('pointerleave', onLeave);
        if (frame) {
          cancelAnimationFrame(frame);
        }
      });
    });
  }
}
