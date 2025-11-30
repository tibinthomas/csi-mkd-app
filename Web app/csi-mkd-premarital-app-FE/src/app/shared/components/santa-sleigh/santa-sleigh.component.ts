import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-santa-sleigh',
  imports: [CommonModule],
  template: `
    @if (isVisible) {
      <div class="sleigh-container" [class.flying]="isFlying">
        <div class="sleigh">
          <!-- Reindeer -->
          <div class="reindeer">
            <span class="reindeer-emoji">🦌</span>
            <span class="reindeer-emoji">🦌</span>
          </div>
          
          <!-- Santa and Sleigh -->
          <div class="santa-sleigh">
            <span class="santa">🎅</span>
            <span class="sleigh-emoji">🛷</span>
          </div>
          
          <!-- Gift Sack -->
          <div class="gifts">
            <span>🎁</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .sleigh-container {
      position: fixed;
      top: 15%;
      right: -300px; /* Start from right */
      z-index: 9997;
      pointer-events: none !important;
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
      transform: scaleX(-1); /* Flip horizontally so Santa faces left */
    }

    .sleigh-container.flying {
      opacity: 1;
      animation: sleigh-fly 12s linear;
    }

    .sleigh {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 48px;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
      transform-origin: center;
    }

    .reindeer {
      display: flex;
      gap: 4px;
      animation: reindeer-jump 0.5s ease-in-out infinite alternate;
    }

    .reindeer-emoji {
      display: inline-block;
      animation: reindeer-run 0.3s ease-in-out infinite alternate;
    }

    .reindeer-emoji:nth-child(2) {
      animation-delay: 0.15s;
    }

    .santa-sleigh {
      display: flex;
      align-items: center;
      gap: -4px;
      animation: sleigh-bounce 0.6s ease-in-out infinite;
    }

    .santa {
      transform: scale(1.1);
      z-index: 1;
    }

    .gifts {
      animation: gift-wobble 0.4s ease-in-out infinite alternate;
    }

    @keyframes sleigh-fly {
      0% {
        transform: translateX(0) translateY(0) rotate(0deg);
      }
      10% {
        transform: translateX(-10vw) translateY(-20px) rotate(2deg);
      }
      50% {
        transform: translateX(-50vw) translateY(-40px) rotate(-2deg);
      }
      90% {
        transform: translateX(-90vw) translateY(-20px) rotate(2deg);
      }
      100% {
        transform: translateX(calc(-100vw - 300px)) translateY(0) rotate(0deg);
      }
    }

    @keyframes reindeer-jump {
      0% { transform: translateY(0); }
      100% { transform: translateY(-8px); }
    }

    @keyframes reindeer-run {
      0% { transform: rotate(-5deg); }
      100% { transform: rotate(5deg); }
    }

    @keyframes sleigh-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    @keyframes gift-wobble {
      0% { transform: rotate(-3deg); }
      100% { transform: rotate(3deg); }
    }

    /* Smaller on mobile */
    @media (max-width: 768px) {
      .sleigh {
        font-size: 32px;
      }
      
      .sleigh-container {
        top: 20%;
      }
    }

    /* Reduce motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
      .sleigh-container.flying {
        animation: sleigh-fly-simple 12s linear;
      }
      
      .reindeer, .santa-sleigh, .gifts, .reindeer-emoji {
        animation: none;
      }
      
      @keyframes sleigh-fly-simple {
        from { transform: translateX(0); }
        to { transform: translateX(calc(-100vw - 300px)); }
      }
    }
  `]
})
export class SantaSleighComponent implements OnInit, OnDestroy {
  isVisible = false;
  isFlying = false;
  private intervalId?: number;

  ngOnInit(): void {
    // Santa flies by every 45-60 seconds
    this.scheduleFlight();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private scheduleFlight(): void {
    // First flight after 10 seconds
    setTimeout(() => this.fly(), 10000);

    // Then schedule regular flights
    this.intervalId = window.setInterval(() => {
      this.fly();
    }, 45000 + Math.random() * 15000); // 45-60 seconds
  }

  private fly(): void {
    this.isVisible = true;
    // Small delay to trigger animation
    setTimeout(() => {
      this.isFlying = true;
    }, 50);

    // Hide after animation completes
    setTimeout(() => {
      this.isFlying = false;
      setTimeout(() => {
        this.isVisible = false;
      }, 500);
    }, 12000);
  }
}
