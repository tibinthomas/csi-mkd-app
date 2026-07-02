import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-christmas-countdown',
  imports: [CommonModule],
  template: `
    <div class="countdown-container" [class.christmas-day]="isChristmas">
      @if (isChristmas) {
        <div class="christmas-message">
          <div class="message-icon">🎄🎅🎁</div>
          <div class="message-text">Merry Christmas!</div>
          <div class="message-subtext">Wishing you joy and peace</div>
        </div>
      } @else {
        <div class="countdown-content">
          <div class="countdown-title">
            <span class="tree-icon">🎄</span>
            Christmas Countdown
            <span class="tree-icon">🎄</span>
          </div>
          <div class="countdown-timer">
            <div class="time-unit">
              <div class="time-value">{{ timeRemaining.days }}</div>
              <div class="time-label">Days</div>
            </div>
            <div class="time-separator">:</div>
            <div class="time-unit">
              <div class="time-value">{{ timeRemaining.hours }}</div>
              <div class="time-label">Hours</div>
            </div>
            <div class="time-separator">:</div>
            <div class="time-unit">
              <div class="time-value">{{ timeRemaining.minutes }}</div>
              <div class="time-label">Minutes</div>
            </div>
            <div class="time-separator">:</div>
            <div class="time-unit">
              <div class="time-value">{{ timeRemaining.seconds }}</div>
              <div class="time-label">Seconds</div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .countdown-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, rgba(212, 36, 38, 0.95) 0%, rgba(45, 80, 22, 0.95) 100%);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 215, 0, 0.3);
      z-index: 9995;
      color: white;
      animation: float 4s ease-in-out infinite;
      max-width: 90vw;
    }

    .countdown-container.christmas-day {
      background: linear-gradient(135deg, #ffd700 0%, #ff6b6b 50%, #4ecdc4 100%);
      animation: rainbow-pulse 2s ease-in-out infinite;
    }

    .countdown-title {
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .tree-icon {
      font-size: 20px;
      animation: sway 2s ease-in-out infinite;
    }

    .tree-icon:first-child {
      animation-delay: 0s;
    }

    .tree-icon:last-child {
      animation-delay: 1s;
    }

    .countdown-timer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .time-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 60px;
    }

    .time-value {
      font-size: 32px;
      font-weight: bold;
      line-height: 1;
      background: rgba(255, 255, 255, 0.2);
      padding: 10px 15px;
      border-radius: 8px;
      min-width: 60px;
      text-align: center;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
      font-variant-numeric: tabular-nums;
    }

    .time-label {
      font-size: 12px;
      margin-top: 5px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
    }

    .time-separator {
      font-size: 28px;
      font-weight: bold;
      opacity: 0.6;
      animation: blink 1s ease-in-out infinite;
    }

    .christmas-message {
      text-align: center;
      padding: 10px;
    }

    .message-icon {
      font-size: 48px;
      margin-bottom: 10px;
      animation: bounce 1s ease-in-out infinite;
    }

    .message-text {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      animation: glow-text 2s ease-in-out infinite;
    }

    .message-subtext {
      font-size: 16px;
      opacity: 0.9;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @keyframes sway {
      0%, 100% { transform: rotate(-10deg); }
      50% { transform: rotate(10deg); }
    }

    @keyframes blink {
      0%, 49%, 100% { opacity: 0.6; }
      50%, 99% { opacity: 0.2; }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-10px) scale(1.1); }
    }

    @keyframes rainbow-pulse {
      0%, 100% { filter: hue-rotate(0deg) brightness(1); }
      50% { filter: hue-rotate(20deg) brightness(1.2); }
    }

    @keyframes glow-text {
      0%, 100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
      50% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 215, 0, 0.6); }
    }

    @media (max-width: 768px) {
      .countdown-container {
        bottom: 10px;
        right: 10px;
        padding: 15px;
        font-size: 14px;
      }

      .countdown-title {
        font-size: 14px;
      }

      .tree-icon {
        font-size: 16px;
      }

      .time-value {
        font-size: 24px;
        padding: 8px 10px;
        min-width: 50px;
      }

      .time-label {
        font-size: 10px;
      }

      .time-separator {
        font-size: 20px;
      }

      .time-unit {
        min-width: 50px;
      }

      .message-icon {
        font-size: 36px;
      }

      .message-text {
        font-size: 24px;
      }

      .message-subtext {
        font-size: 14px;
      }
    }

    /* Reduce motion */
    @media (prefers-reduced-motion: reduce) {
      .countdown-container,
      .tree-icon,
      .time-separator,
      .message-icon,
      .message-text {
        animation: none;
      }
    }
  `]
})
export class ChristmasCountdownComponent implements OnInit, OnDestroy {
  timeRemaining: TimeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  isChristmas = false;
  private intervalId?: number;

  ngOnInit(): void {
    this.updateCountdown();
    this.intervalId = window.setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateCountdown(): void {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Determine next Christmas
    let christmas = new Date(currentYear, 11, 25); // December 25
    
    // If Christmas has passed this year, target next year
    if (now > christmas) {
      christmas = new Date(currentYear + 1, 11, 25);
    }

    // Check if it's Christmas Day
    if (
      now.getDate() === 25 &&
      now.getMonth() === 11 // December
    ) {
      this.isChristmas = true;
      return;
    }

    this.isChristmas = false;

    const diff = christmas.getTime() - now.getTime();

    this.timeRemaining = {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  }
}
