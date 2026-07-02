import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  opacity: number;
}

@Component({
  selector: 'app-christmas-snow',
  imports: [CommonModule],
  template: `
    <div class="snowfall-container">
      @for (snowflake of snowflakes; track snowflake.id) {
        <div
          class="snowflake"
          [style.left.%]="snowflake.left"
          [style.animation-duration.s]="snowflake.animationDuration"
          [style.animation-delay.s]="snowflake.animationDelay"
          [style.font-size.px]="snowflake.size"
          [style.opacity]="snowflake.opacity"
        >
          ❄
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .snowfall-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none !important;
      z-index: 9999;
      overflow: hidden;
    }

    .snowflake {
      position: absolute;
      top: -10vh;
      color: var(--christmas-white);
      user-select: none;
      pointer-events: none !important;
      animation: snowfall linear infinite;
      text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
    }

    @keyframes snowfall {
      0% {
        transform: translateY(-10vh) translateX(0) rotate(0deg);
      }
      100% {
        transform: translateY(110vh) translateX(50px) rotate(360deg);
      }
    }

    /* Reduce snow on mobile for performance */
    @media (max-width: 768px) {
      .snowflake:nth-child(n+15) {
        display: none;
      }
    }
  `]
})
export class ChristmasSnowComponent implements OnInit, OnDestroy {
  snowflakes: Snowflake[] = [];
  private snowflakeCount = 25; // Reduced for minimal effect

  ngOnInit(): void {
    this.generateSnowflakes();
  }

  ngOnDestroy(): void {
    this.snowflakes = [];
  }

  private generateSnowflakes(): void {
    // Reduce count on mobile
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 10 : this.snowflakeCount; // Even less on mobile

    for (let i = 0; i < count; i++) {
      this.snowflakes.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 8 + Math.random() * 10, // 8-18 seconds
        animationDelay: Math.random() * 5, // 0-5 seconds delay
        size: 10 + Math.random() * 15, // 10-25px
        opacity: 0.3 + Math.random() * 0.7 // 0.3-1.0
      });
    }
  }
}
