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
 * Reveals an element with the given animation the first time it scrolls into
 * view. Honours the device's motion tier: on 'none' the element is shown
 * immediately without animating.
 */
@Directive({
  selector: '[appAnimateOnScroll]',
})
export class AnimateOnScrollDirective {
  readonly animationType = input<string>('fadeIn', {
    alias: 'appAnimateOnScroll',
  });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(MotionService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const element = this.el.nativeElement;

      if (this.motion.tier() === 'none') {
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            element.classList.add(`animate-${this.animationType()}`);
            element.classList.remove('opacity-0');
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      element.classList.add('opacity-0');
      observer.observe(element);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
