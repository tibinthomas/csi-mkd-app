import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CsiMkdPremaritalAppBeService } from '../../../../api/api-main-app/services';

@Component({
  selector: 'app-feedback-dialog',
  template: `
    <div class="afd-wrap">
      @if (!sent()) {
        <div class="afd-head">
          <h2 mat-dialog-title class="!m-0 !p-0 afd-title" i18n>
            How is your experience?
          </h2>
          <p class="afd-subtitle" i18n>
            A moment of your time helps us make this app better for everyone.
          </p>
        </div>

        <mat-dialog-content class="!p-0">
          <div
            class="afd-stars"
            role="radiogroup"
            aria-label="Rate the app from 1 to 5 stars"
            i18n-aria-label
          >
            @for (star of stars; track star) {
              <button
                type="button"
                class="afd-star"
                role="radio"
                [attr.aria-checked]="rating() === star"
                [attr.aria-label]="starLabel(star)"
                (click)="rating.set(star)"
                (mouseenter)="hovered.set(star)"
                (mouseleave)="hovered.set(0)"
                data-testid="app-feedback-star"
              >
                <mat-icon
                  [class.afd-star-on]="star <= (hovered() || rating())"
                  aria-hidden="true"
                >
                  {{ star <= (hovered() || rating()) ? 'star' : 'star_border' }}
                </mat-icon>
              </button>
            }
          </div>

          @if (rating() > 0) {
            <div class="afd-questions">
              <mat-form-field appearance="outline" class="w-full afd-field">
                <mat-label i18n>What do you like most?</mat-label>
                <textarea
                  matInput
                  rows="2"
                  maxlength="2000"
                  [(ngModel)]="likedMost"
                  data-testid="app-feedback-liked"
                ></textarea>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full afd-field">
                <mat-label i18n>What could be better?</mat-label>
                <textarea
                  matInput
                  rows="2"
                  maxlength="2000"
                  [(ngModel)]="improvements"
                  data-testid="app-feedback-improve"
                ></textarea>
              </mat-form-field>
            </div>
          }
        </mat-dialog-content>

        <mat-dialog-actions class="!p-0 afd-actions" align="end">
          <button
            mat-button
            (click)="dialogRef.close(false)"
            data-testid="app-feedback-later"
          >
            <span i18n>Maybe later</span>
          </button>
          <button
            mat-flat-button
            color="primary"
            [disabled]="rating() === 0 || sending()"
            (click)="submit()"
            data-testid="app-feedback-send"
          >
            @if (sending()) {
              <mat-spinner diameter="18"></mat-spinner>
            } @else {
              <span i18n>Send feedback</span>
            }
          </button>
        </mat-dialog-actions>
      } @else {
        <div class="afd-thanks">
          <mat-icon class="afd-thanks-icon" aria-hidden="true"
            >favorite</mat-icon
          >
          <h2 class="afd-title" i18n>Thank you!</h2>
          <p class="afd-subtitle" i18n>Your feedback means a lot to us.</p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .afd-wrap {
        padding: 1.5rem;
        max-width: 22rem;
      }
      .afd-title {
        font-size: 1.2rem;
        font-weight: 600;
        line-height: 1.4;
      }
      .afd-subtitle {
        font-size: 0.875rem;
        opacity: 0.7;
        margin: 0.25rem 0 0;
        line-height: 1.6;
      }
      .afd-stars {
        display: flex;
        justify-content: center;
        gap: 0.25rem;
        margin: 1.25rem 0 0.5rem;
      }
      .afd-star {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        line-height: 0;
        transition: transform 0.15s ease;
      }
      .afd-star:hover {
        transform: scale(1.15);
      }
      .afd-star mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: var(--mat-sys-outline, #9aa0a6);
        transition: color 0.15s ease;
      }
      .afd-star mat-icon.afd-star-on {
        color: #f5b301;
      }
      .afd-questions {
        margin-top: 0.75rem;
      }
      .afd-field {
        font-size: 0.875rem;
      }
      .afd-actions {
        margin-top: 0.5rem;
        gap: 0.5rem;
      }
      .afd-thanks {
        text-align: center;
        padding: 1rem 0.5rem;
      }
      .afd-thanks-icon {
        font-size: 2.5rem;
        width: 2.5rem;
        height: 2.5rem;
        color: #e0245e;
        margin-bottom: 0.5rem;
      }
    `,
  ],
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFeedbackDialog {
  protected readonly dialogRef = inject(MatDialogRef<AppFeedbackDialog>);
  private readonly api = inject(CsiMkdPremaritalAppBeService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly localeId = inject(LOCALE_ID);

  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly rating = signal(0);
  protected readonly hovered = signal(0);
  protected readonly sending = signal(false);
  protected readonly sent = signal(false);
  protected likedMost = '';
  protected improvements = '';

  protected starLabel(star: number): string {
    return $localize`${star} out of 5 stars`;
  }

  submit(): void {
    if (this.rating() === 0 || this.sending()) {
      return;
    }
    this.sending.set(true);
    this.api
      .submitAppFeedback({
        body: {
          rating: this.rating(),
          likedMost: this.likedMost || null,
          improvements: this.improvements || null,
          page: location.hash || null,
          locale: this.localeId,
        },
      })
      .subscribe({
        next: () => {
          this.sending.set(false);
          this.sent.set(true);
          // Lock the dialog during the thank-you moment so a backdrop/Esc
          // close can't be recorded as a dismissal after a successful send.
          this.dialogRef.disableClose = true;
          setTimeout(() => this.dialogRef.close(true), 1600);
        },
        error: () => {
          this.sending.set(false);
          this.snackBar.open(
            $localize`Could not send feedback. Please try again later.`,
            $localize`Close`,
            { duration: 4000 },
          );
        },
      });
  }
}
