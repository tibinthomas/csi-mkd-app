import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;
  opacity: number;
  char: string;
}

@Component({
  selector: 'app-cursor-effects',
  imports: [CommonModule],
  template: `
    @if (!isMobile) {
      <canvas
        #canvas
        class="cursor-effects-canvas"
        [width]="canvasWidth"
        [height]="canvasHeight"
      ></canvas>
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .cursor-effects-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none !important;
      z-index: 9994;
    }
  `]
})
export class CursorEffectsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;
  
  private ctx?: CanvasRenderingContext2D | null;
  private particles: Particle[] = [];
  private animationId?: number;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private mouseMoving = false;
  private mouseMoveTimeout?: number;
  
  isMobile = false;
  canvasWidth = 0;
  canvasHeight = 0;

  private readonly particleChars = ['❄', '✨', '⭐', '✦', '❅', '❆'];
  private readonly maxParticles = 100;

  ngOnInit(): void {
    // Detect mobile devices
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

    if (!this.isMobile) {
      this.canvasWidth = window.innerWidth;
      this.canvasHeight = window.innerHeight;

      // Listen to window resize
      window.addEventListener('resize', this.handleResize);
      // Listen to mouse move
      window.addEventListener('mousemove', this.handleMouseMove);
    }
  }

  ngAfterViewInit(): void {
    if (!this.isMobile && this.canvasRef) {
      this.ctx = this.canvasRef.nativeElement.getContext('2d');
      this.animate();
    }
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.mouseMoveTimeout) {
      clearTimeout(this.mouseMoveTimeout);
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  private handleResize = (): void => {
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;
  };

  private handleMouseMove = (event: MouseEvent): void => {
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    this.mouseMoving = true;

    if (this.mouseMoveTimeout) {
      clearTimeout(this.mouseMoveTimeout);
    }

    // Create particles while mouse is moving
    if (Math.random() < 0.3) { // 30% chance per move event
      this.createParticle(event.clientX, event.clientY);
    }

    this.mouseMoveTimeout = window.setTimeout(() => {
      this.mouseMoving = false;
    }, 100);
  };

  private createParticle(x: number, y: number): void {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift(); // Remove oldest particle
    }

    const particle: Particle = {
      x,
      y,
      size: 12 + Math.random() * 8, // 12-20px
      speedX: (Math.random() - 0.5) * 2,
      speedY: -Math.random() * 2 - 0.5, // Move upward
      life: 0,
      maxLife: 60 + Math.random() * 60, // 60-120 frames
      opacity: 1,
      char: this.particleChars[Math.floor(Math.random() * this.particleChars.length)]
    };

    this.particles.push(particle);
  }

  private animate = (): void => {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update particle
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.life++;
      particle.opacity = 1 - (particle.life / particle.maxLife);

      // Add slight gravity
      particle.speedY += 0.05;

      // Remove dead particles
      if (particle.life >= particle.maxLife || particle.opacity <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Draw particle
      this.ctx.save();
      this.ctx.font = `${particle.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.globalAlpha = particle.opacity;

      // Add glow effect
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      
      this.ctx.fillText(particle.char, particle.x, particle.y);
      this.ctx.restore();
    }

    this.animationId = requestAnimationFrame(this.animate);
  };
}
