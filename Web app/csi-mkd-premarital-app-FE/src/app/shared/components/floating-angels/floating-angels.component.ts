import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MotionService } from '../../../core/services/motion.service';

interface Angel {
  readonly id: number;
  readonly left: number; // vw %
  readonly size: number; // px
  readonly duration: number; // s, vertical drift
  readonly delay: number; // s, negative = starts mid-flight
  readonly swayDuration: number; // s
  readonly sway: number; // px amplitude
  readonly glyph: string;
  readonly bursting: boolean;
}

interface BurstParticle {
  readonly i: number;
  readonly dx: string;
  readonly dy: string;
  readonly glyph: string;
}

const GLYPHS = ['🕊️', '✨', '🕊️', '🕊️', '✨'];
const BURST_GLYPHS = ['✨', '🤍', '✨', '✨', '🤍', '✨'];
const MAX_ANGELS = 10;
const LITE_ANGELS = 5;

/**
 * Decorative doves and sparkles drifting up the screen. Hovering one makes
 * it glow and pause; clicking/tapping pops it into a small sparkle burst and
 * a new one respawns. A score chip counts every pop for a playful game feel.
 * Honours motion tiers: fewer + no sway on 'lite', nothing rendered on 'none'.
 */
@Component({
  selector: 'app-floating-angels',
  template: `
    @if (motion.tier() !== 'none') {
    <div class="angels-layer" aria-hidden="true" [class.lite]="motion.tier() === 'lite'">
      @for (a of visibleAngels(); track a.id) {
      <div
        class="angel"
        [class.bursting]="a.bursting"
        [style.left.%]="a.left"
        [style.font-size.px]="a.size"
        [style.animation-duration.s]="a.duration"
        [style.animation-delay.s]="a.delay"
      >
        <div class="sway" [style.animation-duration.s]="a.swayDuration" [style.--sway.px]="a.sway">
          @if (!a.bursting) {
          <span class="glyph" (click)="pop(a)">{{ a.glyph }}</span>
          } @else {
          <span class="burst">
            @for (p of burstParticles; track p.i) {
            <span class="particle" [style.--dx]="p.dx" [style.--dy]="p.dy">{{ p.glyph }}</span>
            }
          </span>
          }
        </div>
      </div>
      }

      @if (popCount() > 0) {
      <!-- Recreated on every pop (track popCount) so the bump animation replays -->
      @for (count of [popCount()]; track count) {
      <div class="score-chip">
        <span class="score-glyph">🕊️</span>
        <span class="score-value">{{ count }}</span>
      </div>
      }
      }
    </div>
    }
  `,
  styles: [
    `
      .angels-layer {
        position: fixed;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: 50;
      }

      .angel {
        position: absolute;
        top: 100%;
        animation: angel-rise linear infinite;
        will-change: transform;
      }

      .sway {
        animation: angel-sway ease-in-out infinite alternate;
      }

      .lite .sway {
        animation: none;
      }

      .glyph {
        display: inline-block;
        pointer-events: auto;
        cursor: pointer;
        user-select: none;
        opacity: 0.75;
        filter: drop-shadow(0 2px 6px rgba(216, 166, 87, 0.35));
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease,
          filter 0.3s ease;
      }

      .glyph:hover {
        opacity: 1;
        transform: scale(1.35) rotate(-8deg);
        filter: drop-shadow(0 0 12px rgba(216, 166, 87, 0.8));
      }

      /* Pause the drift while the pointer is on an angel (modern browsers) */
      .angel:has(.glyph:hover),
      .angel:has(.glyph:hover) .sway,
      .angel.bursting,
      .angel.bursting .sway {
        animation-play-state: paused;
      }

      .burst {
        position: relative;
        display: inline-block;
      }

      .particle {
        position: absolute;
        left: 0;
        top: 0;
        font-size: 0.6em;
        animation: angel-burst 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }

      @keyframes angel-rise {
        from {
          transform: translateY(0);
        }
        to {
          transform: translateY(calc(-100vh - 3em));
        }
      }

      @keyframes angel-sway {
        from {
          transform: translateX(calc(var(--sway) * -1)) rotate(-4deg);
        }
        to {
          transform: translateX(var(--sway)) rotate(4deg);
        }
      }

      @keyframes angel-burst {
        from {
          transform: translate(0, 0) scale(1);
          opacity: 1;
        }
        to {
          transform: translate(var(--dx), var(--dy)) scale(0.4);
          opacity: 0;
        }
      }

      .score-chip {
        position: fixed;
        left: 1.25rem;
        bottom: 1.25rem;
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.4rem 0.9rem;
        border-radius: 999px;
        background: var(--glass-bg, rgba(255, 255, 255, 0.6));
        border: 1px solid rgba(216, 166, 87, 0.5);
        box-shadow: 0 4px 18px rgba(216, 166, 87, 0.25);
        -webkit-backdrop-filter: blur(8px) saturate(160%);
        backdrop-filter: blur(8px) saturate(160%);
        font-weight: 800;
        font-size: 0.95rem;
        color: var(--md-sys-color-on-surface, #333);
        animation: score-bump 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .score-glyph {
        font-size: 1.1rem;
      }

      .score-value {
        min-width: 1.2ch;
        text-align: center;
      }

      @keyframes score-bump {
        0% {
          transform: scale(0.7);
        }
        55% {
          transform: scale(1.18);
        }
        100% {
          transform: scale(1);
        }
      }

      @media (max-width: 768px) {
        .angel:nth-child(n + 7) {
          display: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingAngelsComponent {
  protected readonly motion = inject(MotionService);
  private readonly destroyRef = inject(DestroyRef);

  private nextId = MAX_ANGELS;
  private readonly angels = signal<Angel[]>(
    Array.from({ length: MAX_ANGELS }, (_, i) => this.createAngel(i, true))
  );

  protected readonly visibleAngels = computed(() =>
    this.angels().slice(0, this.motion.tier() === 'lite' ? LITE_ANGELS : MAX_ANGELS)
  );

  protected readonly burstParticles: readonly BurstParticle[] = Array.from(
    { length: 6 },
    (_, i) => {
      const angle = (Math.PI * 2 * i) / 6;
      return {
        i,
        dx: `${Math.round(Math.cos(angle) * 42)}px`,
        dy: `${Math.round(Math.sin(angle) * 42)}px`,
        glyph: BURST_GLYPHS[i],
      };
    }
  );

  protected readonly popCount = signal(0);

  protected pop(angel: Angel): void {
    if (angel.bursting) {
      return;
    }
    this.popCount.update((n) => n + 1);
    this.angels.update((list) =>
      list.map((a) => (a.id === angel.id ? { ...a, bursting: true } : a))
    );

    const timer = setTimeout(() => {
      this.angels.update((list) =>
        list.map((a) => (a.id === angel.id ? this.createAngel(this.nextId++, false) : a))
      );
    }, 700);
    this.destroyRef.onDestroy(() => clearTimeout(timer));
  }

  private createAngel(id: number, midFlight: boolean): Angel {
    const duration = 18 + Math.random() * 16; // 18–34s to cross the screen
    return {
      id,
      left: 2 + Math.random() * 94,
      size: 20 + Math.random() * 16,
      duration,
      // Negative delay scatters the initial flock mid-flight; respawns rise fresh.
      delay: midFlight ? -Math.random() * duration : 0,
      swayDuration: 3 + Math.random() * 4,
      sway: 20 + Math.random() * 45,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      bursting: false,
    };
  }
}
