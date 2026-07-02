import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  viewChild,
} from '@angular/core';

interface TrailPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-cursor-trail',
  template: `
    @if (enabled) {
      <canvas #canvas class="cursor-trail-canvas"></canvas>
    }
  `,
  styles: [
    `
      .cursor-trail-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none !important;
        z-index: 9994;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CursorTrailComponent implements AfterViewInit, OnDestroy {
  private readonly canvasRef =
    viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  // Only on devices with a real pointer, and never for reduced-motion users
  readonly enabled =
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private ctx?: CanvasRenderingContext2D | null;
  private animationId?: number;
  private idleTimeout?: number;

  private readonly trail: TrailPoint[] = [];
  private readonly trailLength = 14;
  private mouseX = 0;
  private mouseY = 0;
  private mouseMoving = false;
  private alpha = 0; // fades the whole trail in/out as the mouse moves/stops

  ngAfterViewInit(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!this.enabled || !canvas) return;

    this.ctx = canvas.getContext('2d');
    this.handleResize();

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('mousemove', this.handleMouseMove, {
      passive: true,
    });

    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  private handleResize = (): void => {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  private handleMouseMove = (event: MouseEvent): void => {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    this.mouseMoving = true;

    // First movement: start the trail right at the cursor
    if (this.trail.length === 0) {
      for (let i = 0; i < this.trailLength; i++) {
        this.trail.push({ x: event.clientX, y: event.clientY });
      }
    }

    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    this.idleTimeout = window.setTimeout(() => {
      this.mouseMoving = false;
    }, 150);
  };

  private animate = (): void => {
    const canvas = this.canvasRef()?.nativeElement;
    if (!this.ctx || !canvas) return;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fade in while moving, fade out once idle so dots don't pile up under the cursor
    this.alpha += ((this.mouseMoving ? 1 : 0) - this.alpha) * 0.08;

    if (this.trail.length > 0 && this.alpha > 0.01) {
      // Each dot eases toward the one ahead of it; the head chases the cursor
      let targetX = this.mouseX;
      let targetY = this.mouseY;
      for (const point of this.trail) {
        point.x += (targetX - point.x) * 0.35;
        point.y += (targetY - point.y) * 0.35;
        targetX = point.x;
        targetY = point.y;
      }

      for (let i = this.trail.length - 1; i >= 0; i--) {
        const point = this.trail[i];
        const progress = i / this.trail.length; // 0 = head, 1 = tail
        const size = 5 * (1 - progress) + 1;

        this.ctx.save();
        this.ctx.globalAlpha = this.alpha * (1 - progress) * 0.7;
        this.ctx.fillStyle = `hsl(${210 + progress * 40}, 90%, 60%)`;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = 'rgba(100, 170, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    this.animationId = requestAnimationFrame(this.animate);
  };
}
