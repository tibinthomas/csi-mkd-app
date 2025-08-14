import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { CsiMkdPremaritalAppBeService } from '../../../api/services';
import { NoDigitsDirective } from '../../shared/directives/no-digits.directive';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.html',
  styleUrl: './feedback.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    NoDigitsDirective,
  ],
})
export class Feedback {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CsiMkdPremaritalAppBeService);
  @ViewChild('formEl') formEl!: ElementRef<HTMLFormElement>;
  protected readonly sessionTitles = signal<any>([
    { id: '1', title: 'Session 1: Notion about Marriage Life' },
    { id: '2', title: 'Session 2: Faith' },
    { id: '3', title: 'Session 3: Communication' },
    { id: '4', title: 'Session 4: Family and Parenting' },
    { id: '5', title: 'Session 5: Know your Partner' },
    { id: '6', title: 'Session 6: Personality' },
    { id: '7', title: 'Session 7: Sex and Spirituality' },
    { id: '8', title: 'Session 8: Addiction' },
    { id: '9', title: 'Session 9: Law in Marriage' },
    { id: '10', title: 'Session 10: Emotional Hygiene and Stress' },
    { id: '11', title: 'Session 11: Management' },
    { id: '12', title: 'Session 12: Conflict Management' },
    { id: '13', title: 'Session 13: Pregnancy and Childbirth' },
    { id: '14', title: 'Session 14: Mens Sexuality' },
    { id: '15', title: 'Session 15: Sacrementality' },
    { id: '16', title: 'Session 16: Overall Feedback' },
  ]);

  protected readonly feedbackForm = this.fb.group({
    sessionTitle: ['', [Validators.required, Validators.maxLength(100)]],
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z\s]*$/),
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
    date: ['', Validators.required],
    qualityRating: [
      '',
      [Validators.required, Validators.min(1), Validators.max(10)],
    ],
    relevanceRating: [
      '',
      [Validators.required, Validators.min(1), Validators.max(10)],
    ],
    engagementRating: [
      '',
      [Validators.required, Validators.min(1), Validators.max(10)],
    ],
    organizationRating: [
      '',
      [Validators.required, Validators.min(1), Validators.max(10)],
    ],
    valuable: ['', Validators.maxLength(500)],
    improvements: ['', Validators.maxLength(500)],
    comments: ['', Validators.maxLength(500)],
  });

  protected readonly isSubmitting = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly timezoneDisplay: string = 'Time Zone: IST (UTC+05:30)';

  onSubmit() {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      this.focusFirstInvalidControl();
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const payload = this.feedbackForm.value;
    this.api.apiFeedbackPost({ body: payload as any }).subscribe({
      next: () => {
        this.successMessage.set('Feedback submitted successfully!');
        this.feedbackForm.reset();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          'Failed to submit feedback. Please try again later.'
        );
        console.error(err);
        this.isSubmitting.set(false);
      },
    });
  }

  hasPendingChanges = (): boolean => {
    return this.feedbackForm.dirty && !this.isSubmitting();
  };

  ngOnInit(): void {
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (this.hasPendingChanges()) {
      event.preventDefault();
      event.returnValue = '';
    }
  };

  private focusFirstInvalidControl(): void {
    try {
      const formElement = this.formEl?.nativeElement;
      if (!formElement) return;
      const firstInvalid: HTMLElement | null = formElement.querySelector(
        'input.ng-invalid, textarea.ng-invalid, select.ng-invalid, mat-select.ng-invalid'
      );
      if (firstInvalid) {
        if (typeof (firstInvalid as any).focus === 'function') {
          (firstInvalid as HTMLElement).focus({ preventScroll: false });
        } else {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } catch {
      // no-op
    }
  }
}
