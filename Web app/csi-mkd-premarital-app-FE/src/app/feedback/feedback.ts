import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { CsiMkdPremaritalAppBeService } from '../../api/services';
import { MatNativeDateModule } from '@angular/material/core';

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
  ],
})
export class Feedback {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CsiMkdPremaritalAppBeService);

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

  onSubmit() {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
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
}
