import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true,
})
export class AnimateOnScrollDirective implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.renderer.addClass(this.el.nativeElement, 'animate');
          this.renderer.removeClass(this.el.nativeElement, 'opacity-0');
          observer.disconnect(); // Optional: animate once only
        }
      },
      {
        threshold: 0.1,
      }
    );

    this.renderer.addClass(this.el.nativeElement, 'opacity-0');
    observer.observe(this.el.nativeElement);
  }
}
