import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ElementRef,
  ViewChild,
  OnInit,
  input,
  effect,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { SpeechRecognitionDirective } from '../../shared/directives/speech-recognition.directive';
import {
  FeedbackResponseDto,
} from '../../../api/api-main-app/models';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

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
    MatIconModule,
    SpeechRecognitionDirective,
  ],
})
export class Feedback implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CsiMkdPremaritalAppBeService);
  private readonly route = inject(ActivatedRoute);
  @ViewChild('formEl') formEl!: ElementRef<HTMLFormElement>;
  userDetails = signal<{ name: string; email: string }>({ name: '', email: '' });

  userId = signal<string>('');
  classId = input<string>();

  constructor() {
    // Get userId from route params
    const routeUserId = this.route.snapshot.paramMap.get('userId');
    if (routeUserId) {
      this.userId.set(routeUserId);
    }

    effect(() => {
      const feedbackData = this.existingFeedbackResource.value();
      const targetClassId = this.classId();

      if (feedbackData && Array.isArray(feedbackData) && targetClassId) {
        this.populateFormWithExistingFeedback(feedbackData, targetClassId);
      }
    });

    // Effect to update user details and form when user data loads
    effect(() => {
      const userData = this.userDetailsResource.value();
      if (userData) {
        const parsedUser = JSON.parse(userData as string);
        this.userDetails.set({
          name: `${parsedUser.FirstName} ${parsedUser.LastName}`,
          email: parsedUser.Email,
        });
        this.feedbackForm.patchValue({
          premaritalRegistrationId: this.userId() || '',
        });
      }
    });
  }

  ratingLabels: Record<string, string> = {
    qualityRating: 'Overall Quality',
    relevanceRating: 'Content Relevance',
    engagementRating: 'Presenter Engagement',
    organizationRating: 'Organization',
  };

  protected readonly classTitles = signal<any>([
    {
      id: '1',
      title:
        'Class 1: Biblical aspects of Marriage, Faith and Practices of CSI',
    },
    { id: '2', title: 'Class 2: Communication' },
    { id: '3', title: 'Class 3: Family and Parenting' },
    { id: '4', title: 'Class 4: Know your Partner' },
    { id: '5', title: 'Class 5: Emotional Hygiene and Stress management ' },
    { id: '6', title: 'Class 6: Sex and Spirituality' },
    { id: '7', title: 'Class 7: Addiction' },
    { id: '8', title: 'Class 8: Law in Marriage' },
    { id: '9', title: 'Class 9: Personality' },
    { id: '10', title: 'Class 10: Management' },
    { id: '11', title: 'Class 11: Conflict Management' },
    { id: '12', title: 'Class 12: Pregnancy and Childbirth' },
    { id: '13', title: "Class 13: Men's Sexuality" },
    {
      id: '14',
      title: 'Class 14: Sacrementality in Marriage and marriage rehearsal',
    },
    { id: '15', title: 'Class 15: Overall Feedback' },
  ]);

  protected readonly feedbackForm = this.fb.group({
    classTitle: [null, [Validators.required, Validators.maxLength(100)]], // required
    date: ['', Validators.required], // required
    qualityRating: [
      null,
      [Validators.required, Validators.min(1), Validators.max(5)],
    ],
    relevanceRating: [
      null,
      [Validators.required, Validators.min(1), Validators.max(5)],
    ],
    engagementRating: [
      null,
      [Validators.required, Validators.min(1), Validators.max(5)],
    ],
    organizationRating: [
      null,
      [Validators.required, Validators.min(1), Validators.max(5)],
    ],
    valuable: [null, Validators.maxLength(500)], // optional
    improvements: [null, Validators.maxLength(500)], // optional
    comments: [null, Validators.maxLength(500)], // optional
    premaritalRegistrationId: [''], // optional, will be set programmatically
  });

  protected readonly isSubmitting = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly timezoneDisplay: string = 'Time Zone: IST (UTC+05:30)';

  // Resource to fetch user details from the API
  protected readonly userDetailsResource = rxResource({
    params: () => this.userId(),
    stream: ({ params: userId }) =>
      userId
        ? this.api.apiPremaritalregisterIdGet({
            id: userId,
          })
        : of(null),
  });

  protected readonly completedFeedbackResource = rxResource({
    params: () => this.userId(),
    stream: ({ params: userId }) =>
      userId
        ? this.api.apiCosmosFeedbackCompletedRegistrationIdGet({
            registrationId: userId,
          })
        : of(null), // Always return an observable
  });

  protected readonly existingFeedbackResource = rxResource({
    // params should be a function returning the current value
    params: () => this.userId(),
    stream: ({ params: userId }) =>
      userId
        ? this.api.apiCosmosFeedbackRegistrationRegistrationIdGet({
            registrationId: userId,
          })
        : of(null), // Use of(null) to return an observable when no userId
  });

  getFormControl(name: string) {
    return this.feedbackForm.get(name);
  }

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
    this.api.apiCosmosFeedbackPost({ body: payload as any }).subscribe({
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
    // User details are now handled in the constructor effect
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private populateFormWithExistingFeedback(
    feedbackData: FeedbackResponseDto[],
    targetClassId: string
  ): void {
    const existingFeedback = feedbackData.find(
      (feedback) => feedback.classId?.toString() === targetClassId
    );

    if (existingFeedback) {
      const formData: any = {
        classTitle: targetClassId,
        date: existingFeedback.date || '',
        qualityRating: existingFeedback.ratings?.quality || null,
        relevanceRating: existingFeedback.ratings?.relevance || null,
        engagementRating: existingFeedback.ratings?.engagement || null,
        organizationRating: existingFeedback.ratings?.organization || null,
        valuable: existingFeedback.textResponses?.valuable || null,
        improvements: existingFeedback.textResponses?.improvements || null,
        comments: existingFeedback.textResponses?.comments || null,
        premaritalRegistrationId: this.userId() || '',
      };

      this.feedbackForm.patchValue(formData);
    }
  }

  private beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (this.hasPendingChanges()) {
      event.preventDefault();
      return '';
    }
    return undefined;
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
