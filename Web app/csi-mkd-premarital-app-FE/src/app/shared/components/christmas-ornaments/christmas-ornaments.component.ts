import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Ornament {
  id: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color: string;
  size: number;
  delay: number;
  swayDuration: number;
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
          [style.animation-delay.s]="ornament.delay"
        >
          <div class="string"></div>
          <div
            class="ornament"
            [style.width.px]="ornament.size"
            [style.height.px]="ornament.size"
            [style.background]="getGradient(ornament.color)"
            [style.animation-duration.s]="ornament.swayDuration"
          >
            <div class="ornament-shine"></div>
            <div class="ornament-cap"></div>
          </div>
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
    }

    .ornament-wrapper.top-left {
      top: 80px;
      left: 5%;
    }

    .ornament-wrapper.top-right {
      top: 80px;
      right: 5%;
    }

    .ornament-wrapper.bottom-left {
      bottom: 10%;
      left: 3%;
    }

    .ornament-wrapper.bottom-right {
      bottom: 10%;
      right: 3%;
    }

    .string {
      width: 2px;
      height: 30px;
      background: linear-gradient(to bottom, #2d5016, #4a7c3b);
      margin: 0 auto;
      border-radius: 1px;
    }

    .ornament {
      position: relative;
      border-radius: 50%;
      box-shadow: 
        inset -5px -5px 15px rgba(0, 0, 0, 0.3),
        inset 5px 5px 15px rgba(255, 255, 255, 0.3),
        0 5px 15px rgba(0, 0, 0, 0.3);
      animation: float 3s ease-in-out infinite, sparkle-rotate 6s linear infinite;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .ornament:hover {
      transform: scale(1.1) rotate(5deg);
      animation-play-state: paused;
    }

    .ornament-cap {
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 40%;
      height: 12px;
      background: linear-gradient(to bottom, #ffd700, #daa520);
      border-radius: 4px 4px 0 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .ornament-cap::before {
      content: '';
      position: absolute;
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 6px;
      background: #b8860b;
      border-radius: 2px;
    }

    .ornament-shine {
      position: absolute;
      top: 15%;
      left: 20%;
      width: 30%;
      height: 30%;
      background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.8) 0%,
        rgba(255, 255, 255, 0.3) 50%,
        transparent 100%
      );
      border-radius: 50%;
      filter: blur(2px);
    }

    @keyframes sway {
      0%, 100% { transform: rotate(-5deg); }
      50% { transform: rotate(5deg); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @keyframes sparkle-rotate {
      from { filter: hue-rotate(0deg); }
      to { filter: hue-rotate(360deg); }
    }

    /* Hide some ornaments on mobile */
    @media (max-width: 768px) {
      .ornament-wrapper.bottom-left,
      .ornament-wrapper.bottom-right {
        display: none;
      }
      
      .ornament {
        transform: scale(0.8);
      }
    }

    /* Reduce motion */
    @media (prefers-reduced-motion: reduce) {
      .ornament-wrapper,
      .ornament {
        animation: none;
      }
    }
  `]
})
export class ChristmasOrnamentsComponent implements OnInit {
  ornaments: Ornament[] = [];
  
  private colors = [
    '#d42426', // red
    '#4a7c3b', // green
    '#ffd700', // gold
    '#4169e1', // blue
    '#c0c0c0', // silver
    '#a91b1e', // crimson
  ];

  private positions: Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> = [
    'top-left',
    'top-right'
    // Only show top ornaments for minimal look
  ];

  ngOnInit(): void {
    this.generateOrnaments();
  }

  private generateOrnaments(): void {
    this.positions.forEach((position, index) => {
      this.ornaments.push({
        id: index,
        position,
        color: this.colors[index % this.colors.length],
        size: 40 + Math.random() * 20, // 40-60px
        delay: index * 0.5,
        swayDuration: 3 + Math.random() * 2 // 3-5 seconds
      });
    });
  }

  getGradient(color: string): string {
    return `radial-gradient(circle at 30% 30%, ${color}, ${this.darkenColor(color, 40)})`;
  }

  private darkenColor(color: string, percent: number): string {
    // Simple color darkening
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
