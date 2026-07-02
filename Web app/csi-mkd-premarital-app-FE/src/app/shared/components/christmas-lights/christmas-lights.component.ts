import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Light {
  id: number;
  color: string;
  delay: number;
}

@Component({
  selector: 'app-christmas-lights',
  imports: [CommonModule],
  template: `
    <div class="christmas-lights-container">
      <div class="wire"></div>
      @for (light of lights; track light.id) {
        <div
          class="light-wrapper"
          [style.left.%]="(light.id / lights.length) * 100"
        >
          <div
            class="light"
            [style.background-color]="light.color"
            [style.animation-delay.s]="light.delay"
          ></div>
          <div class="light-glow" [style.background-color]="light.color"></div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .christmas-lights-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 80px;
      pointer-events: none;
      z-index: 9998;
      overflow: hidden;
    }

    .wire {
      position: absolute;
      top: 10px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        #2d5016 10%,
        #2d5016 90%,
        transparent 100%
      );
    }

    .light-wrapper {
      position: absolute;
      top: 10px;
      transform: translateX(-50%);
    }

    .light {
      width: 12px;
      height: 18px;
      border-radius: 0 0 50% 50%;
      position: relative;
      animation: twinkle 1.5s ease-in-out infinite;
      box-shadow: 
        0 0 5px currentColor,
        0 0 10px currentColor,
        inset 0 -2px 4px rgba(0, 0, 0, 0.3);
    }

    .light::before {
      content: '';
      position: absolute;
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 8px;
      height: 6px;
      background: linear-gradient(to bottom, #444, #666);
      border-radius: 2px 2px 0 0;
    }

    .light-glow {
      position: absolute;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 30px;
      border-radius: 50%;
      filter: blur(8px);
      opacity: 0.4;
      animation: pulse-glow 1.5s ease-in-out infinite;
    }

    @keyframes twinkle {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.95); }
    }

    @keyframes pulse-glow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.7; }
    }

    /* Reduce lights on mobile */
    @media (max-width: 768px) {
      .light-wrapper:nth-child(2n) {
        display: none;
      }
      
      .light {
        width: 10px;
        height: 15px;
      }
    }
  `]
})
export class ChristmasLightsComponent implements OnInit {
  lights: Light[] = [];
  private colors = [
    '#d42426', // red
    '#4a7c3b', // green
    '#4169e1', // blue
    '#ffd700', // gold
    '#ffffff', // white
    '#ff69b4', // pink
  ];

  ngOnInit(): void {
    this.generateLights();
  }

  private generateLights(): void {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 15 : 30;

    for (let i = 0; i < count; i++) {
      this.lights.push({
        id: i,
        color: this.colors[i % this.colors.length],
        delay: (i * 0.1) % 1.5 // Stagger the twinkling
      });
    }
  }
}
