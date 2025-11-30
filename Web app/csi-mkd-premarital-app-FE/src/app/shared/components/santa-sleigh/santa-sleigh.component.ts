import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-santa-sleigh',
  imports: [CommonModule],
  template: `
    @if (isVisible) {
      <div class="sleigh-container" [class.flying]="isFlying">
        <div class="sleigh">
          <svg viewBox="0 0 1200 400" class="santa-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="overflow: visible;">
            <defs>
              <!-- Richer Gold Gradient -->
              <linearGradient id="premiumGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FDB931;stop-opacity:1" />
                <stop offset="30%" style="stop-color:#996515;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#FDB931;stop-opacity:1" />
                <stop offset="70%" style="stop-color:#996515;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FDB931;stop-opacity:1" />
              </linearGradient>
              
              <!-- Soft Outer Glow -->
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
              
              <!-- Sparkle Shape -->
              <path id="sparkle" d="M0,5 Q5,5 5,0 Q5,5 10,5 Q5,5 5,10 Q5,5 0,5" fill="#FFF" />
            </defs>

            <g transform="translate(50, 50)">
              <!-- Trailing Magic Dust (Circles) -->
              <g fill="#FDB931" opacity="0.6">
                <circle cx="20" cy="140" r="2">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="40" cy="150" r="3">
                  <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                </circle>
                <circle cx="10" cy="120" r="1.5">
                  <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="0.2s"/>
                </circle>
              </g>

              <!-- Sleigh Runners (Ornate) -->
              <path fill="url(#premiumGold)" filter="url(#softGlow)" d="M50,150 C30,150 20,140 20,130 C20,125 25,125 25,130 C25,135 35,140 50,140 L200,140 C230,140 250,120 250,100 C250,95 255,95 255,100 C255,130 230,150 200,150 Z"/>
              
              <!-- Sleigh Body (Detailed) -->
              <path fill="url(#premiumGold)" filter="url(#softGlow)" d="M60,130 C50,130 40,120 40,100 C40,70 60,50 90,50 L180,50 C210,50 220,70 220,90 L210,130 Z M190,50 L190,40 C190,35 195,35 195,40 L195,50 Z"/>

              <!-- Santa (Detailed Silhouette) -->
              <path fill="url(#premiumGold)" filter="url(#softGlow)" d="M120,90 C110,90 100,80 100,60 C100,45 110,35 125,35 C135,35 140,40 145,45 C150,40 155,40 160,45 L165,80 C165,90 150,90 120,90 Z M125,35 C120,30 130,20 135,25"/>

              <!-- Reindeer 1 (Rear) -->
              <path fill="url(#premiumGold)" filter="url(#softGlow)" d="M350,100 Q360,80 380,80 L420,80 Q440,80 450,100 L440,130 L430,130 L435,110 L405,110 L410,130 L400,130 L390,110 Q380,110 380,100 Q380,90 390,90 L410,90 L350,100 Z M420,80 L430,60 L440,70"/>

              <!-- Reindeer 2 (Middle - Jumping) -->
              <path fill="url(#premiumGold)" filter="url(#softGlow)" d="M500,70 Q510,50 530,50 L570,50 Q590,50 600,70 L590,100 L580,100 L585,80 L555,80 L560,100 L550,100 L540,80 Q530,80 530,70 Q530,60 540,60 L560,60 L500,70 Z M570,50 L580,30 L590,40"/>

              <!-- Reindeer 3 (Lead - Flying High) -->
              <path fill="url(#premiumGold)" filter="url(#softGlow)" d="M650,40 Q660,20 680,20 L720,20 Q740,20 750,40 L740,70 L730,70 L735,50 L705,50 L710,70 L700,70 L690,50 Q680,50 680,40 Q680,30 690,30 L710,30 L650,40 Z M720,20 L730,0 L740,10"/>

              <!-- Reins (Curved) -->
              <path stroke="url(#premiumGold)" stroke-width="1" fill="none" d="M220,70 Q350,60 650,40"/>
            </g>
          </svg>
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
      display: block;
      transform-origin: center;
      width: 350px;
      height: auto;
      /* Drop shadow for extra depth */
      filter: drop-shadow(0 5px 15px rgba(255, 215, 0, 0.3));
    }

    .santa-svg {
      width: 100%;
      height: auto;
      display: block;
      overflow: visible;
      animation: float 4s ease-in-out infinite;
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
        transform: translateX(calc(-100vw - 400px)) translateY(0) rotate(0deg);
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    /* Smaller on mobile */
    @media (max-width: 768px) {
      .sleigh {
        width: 250px;
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
      
      .santa-image {
        animation: none;
      }
      
      @keyframes sleigh-fly-simple {
        from { transform: translateX(0); }
        to { transform: translateX(calc(-100vw - 400px)); }
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
