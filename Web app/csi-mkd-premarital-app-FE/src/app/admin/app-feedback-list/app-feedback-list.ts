import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import { AppFeedbackResponseDto } from '../../../api/api-main-app/models';

@Component({
  selector: 'app-app-feedback-list',
  template: `
    <div class="container mx-auto p-4 max-w-5xl">
      <div class="cx-page-head">
        <span class="cx-icon-chip cx-icon-chip--gold"
          ><mat-icon>rate_review</mat-icon></span
        >
        <div class="cx-page-head-text">
          <h1 i18n>App Feedback</h1>
          <p i18n>What visitors say about this web app.</p>
        </div>
        <span class="flex-1"></span>
        <button
          mat-raised-button
          color="primary"
          (click)="load()"
          [disabled]="isLoading()"
          data-testid="app-feedback-refresh"
        >
          <mat-icon>refresh</mat-icon>
          <span i18n>Refresh</span>
        </button>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center py-12">
          <mat-progress-spinner
            diameter="50"
            mode="indeterminate"
          ></mat-progress-spinner>
        </div>
      } @else if (loadFailed()) {
        <mat-card class="text-center py-12">
          <mat-card-content>
            <mat-icon class="text-6xl text-error mb-4">error</mat-icon>
            <h3 class="text-xl font-semibold mb-2" i18n>
              Failed to load app feedback
            </h3>
            <button
              mat-button
              color="primary"
              (click)="load()"
              data-testid="app-feedback-retry"
            >
              <span i18n>Try Again</span>
            </button>
          </mat-card-content>
        </mat-card>
      } @else if (items().length === 0) {
        <mat-card class="text-center py-12">
          <mat-card-content>
            <mat-icon class="text-6xl text-on-surface-variant mb-4"
              >reviews</mat-icon
            >
            <h3 class="text-xl font-semibold mb-2" i18n>No feedback yet</h3>
            <p class="text-on-surface-variant" i18n>
              Feedback shared by visitors will appear here.
            </p>
          </mat-card-content>
        </mat-card>
      } @else {
        <!-- Summary -->
        <mat-card class="mb-6">
          <mat-card-content class="flex flex-wrap items-center gap-6 !py-4">
            <div class="flex items-center gap-2">
              <span class="text-4xl font-bold">{{
                average() | number: '1.1-1'
              }}</span>
              <div class="flex" aria-hidden="true">
                @for (star of stars; track star) {
                  <mat-icon class="afl-star">
                    {{ star <= roundedAverage() ? 'star' : 'star_border' }}
                  </mat-icon>
                }
              </div>
            </div>
            <span class="text-on-surface-variant">
              {{ items().length }} <ng-container i18n>reviews</ng-container>
            </span>
          </mat-card-content>
        </mat-card>

        <!-- Entries -->
        <div class="space-y-4">
          @for (fb of items(); track fb.id) {
            <mat-card>
              <mat-card-content class="!py-4">
                <div class="flex items-center gap-2 mb-2">
                  <div class="flex" aria-hidden="true">
                    @for (star of stars; track star) {
                      <mat-icon class="afl-star">
                        {{ star <= (fb.rating || 0) ? 'star' : 'star_border' }}
                      </mat-icon>
                    }
                  </div>
                  <span class="flex-1"></span>
                  <span class="text-sm text-on-surface-variant">
                    {{ fb.createdAt | date: 'medium' }}
                  </span>
                </div>
                @if (fb.likedMost) {
                  <p class="mb-1">
                    <strong i18n>Likes:</strong> {{ fb.likedMost }}
                  </p>
                }
                @if (fb.improvements) {
                  <p class="mb-1">
                    <strong i18n>Could be better:</strong> {{ fb.improvements }}
                  </p>
                }
                <p class="text-xs text-on-surface-variant mt-2">
                  @if (fb.page) {
                    <span>{{ fb.page }}</span>
                  }
                  @if (fb.locale) {
                    <span class="ml-2 uppercase">{{ fb.locale }}</span>
                  }
                </p>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .afl-star {
        color: #f5b301;
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }
    `,
  ],
  imports: [
    DatePipe,
    DecimalPipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFeedbackList implements OnInit {
  private readonly api = inject(CsiMkdPremaritalAppBeService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly isLoading = signal(false);
  protected readonly loadFailed = signal(false);
  protected readonly items = signal<AppFeedbackResponseDto[]>([]);
  protected readonly average = computed(() => {
    const list = this.items();
    return list.length
      ? list.reduce((sum, f) => sum + (f.rating || 0), 0) / list.length
      : 0;
  });
  protected readonly roundedAverage = computed(() =>
    Math.round(this.average()),
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.loadFailed.set(false);
    this.api.getAppFeedback().subscribe({
      next: (items) => {
        this.items.set(items || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadFailed.set(true);
        this.snackBar.open(
          $localize`Failed to load app feedback`,
          $localize`Close`,
          { duration: 4000 },
        );
      },
    });
  }
}
