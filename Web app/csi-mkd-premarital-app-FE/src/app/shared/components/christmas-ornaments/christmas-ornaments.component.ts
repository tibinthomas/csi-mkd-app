import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Ornament {
  id: number;
  position: 'top-left' | 'top-right';
  type: 'round' | 'star' | 'bell';
  color: string;
  size: number;
  delay: number;
  swayDuration: number;
  leftOffset: number; // Random horizontal offset
  chainLength: number;
}

@Component({
  selector: 'app-christmas-ornaments',
  imports: [CommonModule],
  template: `
    <div class="ornaments-container">
      @for (ornament of ornaments; track ornament.id) {
        <div
          class="ornament-wrapper"
          [class]="ornament.position"
          [style.left]="ornament.position === 'top-left' ? ornament.leftOffset + '%' : 'auto'"
          [style.right]="ornament.position === 'top-right' ? ornament.leftOffset + '%' : 'auto'"
          [style.animation-delay.s]="ornament.delay"
        >
          <!-- Golden Chain -->
          <div class="chain" [style.height.px]="ornament.chainLength"></div>
          
          <!-- Round Ornament -->
          @if (ornament.type === 'round') {
            <div
              class="ornament round"
              [style.width.px]="ornament.size"
              [style.height.px]="ornament.size"
              [style.background]="getGlassGradient(ornament.color)"
              [style.animation-duration.s]="ornament.swayDuration"
            >
              <div class="shine-highlight"></div>
              <div class="ornament-cap"></div>
              <div class="sparkle"></div>
            </div>
          }

          <!-- Star Ornament -->
          @if (ornament.type === 'star') {
            <div 
              class="ornament star"
              [style.width.px]="ornament.size"
              [style.height.px]="ornament.size"
              [style.animation-duration.s]="ornament.swayDuration"
            >
              <svg viewBox="0 0 24 24" class="shape-svg">
                <defs>
                  <linearGradient [id]="'starGrad' + ornament.id" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" [style.stop-color]="lightenColor(ornament.color, 60)" />
                    <stop offset="40%" [style.stop-color]="ornament.color" />
                    <stop offset="100%" [style.stop-color]="darkenColor(ornament.color, 40)" />
                  </linearGradient>
                  <filter [id]="'glow' + ornament.id">
                    <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path 
                  [attr.fill]="'url(#starGrad' + ornament.id + ')'" 
                  [attr.filter]="'url(#glow' + ornament.id + ')'"
                  d="M12 1.5l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 1.5z"
                  stroke="rgba(255,255,255,0.4)" stroke-width="0.5"
                />
              </svg>
              <div class="ornament-cap"></div>
              <div class="sparkle"></div>
            </div>
          }

          <!-- Bell Ornament -->
          @if (ornament.type === 'bell') {
            <div 
              class="ornament bell"
              [style.width.px]="ornament.size"
              [style.height.px]="ornament.size"
              [style.animation-duration.s]="ornament.swayDuration"
            >
              <svg viewBox="0 0 24 24" class="shape-svg">
                <defs>
                  <linearGradient [id]="'bellGrad' + ornament.id" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" [style.stop-color]="lightenColor(ornament.color, 50)" />
                    <stop offset="50%" [style.stop-color]="ornament.color" />
                    <stop offset="100%" [style.stop-color]="darkenColor(ornament.color, 50)" />
                  </linearGradient>
                </defs>
                <path 
                  [attr.fill]="'url(#bellGrad' + ornament.id + ')'" 
                  d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                  stroke="rgba(255,255,255,0.3)" stroke-width="0.5"
                />
              </svg>
              <div class="ornament-cap"></div>
              <div class="sparkle"></div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .ornaments-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none !important;
      z-index: 9996;
      overflow: hidden;
    }

    .ornament-wrapper {
      position: absolute;
      transform-origin: top center;
      animation: sway 4s ease-in-out infinite;
      filter: drop-shadow(0 15px 25px rgba(0,0,0,0.4)); /* Deeper shadow for 3D depth */
    }

    .ornament-wrapper.top-left { top: -15px; }
    .ornament-wrapper.top-right { top: -15px; }

    /* Premium Golden Chain */
    .chain {
      width: 2px;
      margin: 0 auto;
      background: repeating-linear-gradient(
        to bottom,
        #b8860b 0px,
        #ffd700 2px,
        #b8860b 4px,
        transparent 4px,
        transparent 5px
      );
      box-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      position: relative;
      z-index: 1;
    }

    .ornament {
      position: relative;
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .ornament.round {
      border-radius: 50%;
      /* Complex shadow for glass/metallic look */
      box-shadow: 
        inset -10px -10px 20px rgba(0, 0, 0, 0.6), /* Core shadow */
        inset 5px 5px 15px rgba(255, 255, 255, 0.5), /* Top reflection */
        inset 0 0 5px rgba(255, 255, 255, 0.8), /* Rim light */
        0 0 2px rgba(0,0,0,0.5); /* Definition */
    }

    .shape-svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
    }

    .ornament:hover {
      transform: scale(1.15) rotate(5deg);
      animation-play-state: paused;
      filter: brightness(1.3) contrast(1.1);
    }

    /* Detailed Cap */
    .ornament-cap {
      position: absolute;
      top: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 25%;
      height: 12px;
      background: linear-gradient(90deg, #8a6e2f, #ffd700, #fdb931, #8a6e2f);
      border-radius: 3px 3px 1px 1px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.5);
      z-index: 2;
    }

    .ornament-cap::before {
      content: '';
      position: absolute;
      top: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 8px;
      height: 8px;
      border: 2px solid #ffd700;
      border-radius: 50%;
      box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    .ornament-cap::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(
        90deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,0.3) 2px,
        rgba(0,0,0,0.3) 3px
      );
    }

    /* Specular Highlight */
    .shine-highlight {
      position: absolute;
      top: 15%;
      left: 20%;
      width: 30%;
      height: 20%;
      background: radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%);
      transform: rotate(-45deg);
      opacity: 0.8;
      pointer-events: none;
    }

    /* Twinkling Sparkle */
    .sparkle {
      position: absolute;
      top: 30%;
      left: 30%;
      width: 10px;
      height: 10px;
      background: white;
      clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
      animation: twinkle 3s infinite ease-in-out;
      opacity: 0;
      pointer-events: none;
    }

    @keyframes twinkle {
      0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
      50% { transform: scale(1) rotate(180deg); opacity: 0.8; }
    }

    @keyframes sway {
      0%, 100% { transform: rotate(-4deg); }
      50% { transform: rotate(4deg); }
    }

    @media (max-width: 768px) {
      .chain { height: 40px; }
      .ornament { transform: scale(0.85); }
    }
  `]
})
export class ChristmasOrnamentsComponent implements OnInit {
  ornaments: Ornament[] = [];
  
  private colors = [
    '#990000', // Deep Ruby
    '#004d00', // Forest Green
    '#d4af37', // Antique Gold
    '#0f52ba', // Royal Blue
    '#c0c0c0', // Sterling Silver
    '#800020', // Burgundy
  ];

  private types: Array<'round' | 'star' | 'bell'> = ['round', 'star', 'bell', 'round'];

  ngOnInit(): void {
    this.generateOrnaments();
  }

  private generateOrnaments(): void {
    // Left Side: Cluster (Ball, Star)
    this.ornaments.push({
      id: 2,
      position: 'top-left',
      type: 'round',
      color: '#990000', // Red Ball
      size: 40,
      delay: 0.5,
      swayDuration: 3.5,
      leftOffset: 2,
      chainLength: 80
    });

    this.ornaments.push({
      id: 3,
      position: 'top-left',
      type: 'star',
      color: '#d4af37', // Gold Star
      size: 42,
      delay: 1.0,
      swayDuration: 3.8,
      leftOffset: 6,
      chainLength: 100
    });

    // Right Side: Maroon Ball
    this.ornaments.push({
      id: 4,
      position: 'top-right',
      type: 'round',
      color: '#800020', // Maroon Ball
      size: 45,
      delay: 0.2,
      swayDuration: 4.2,
      leftOffset: 4,
      chainLength: 80
    });
  }

  getGlassGradient(color: string): string {
    // Multi-layered radial gradient for deep glass effect
    return `radial-gradient(circle at 30% 30%, ${this.lightenColor(color, 60)}, ${color}, ${this.darkenColor(color, 50)})`;
  }

  lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }

  darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }
}
