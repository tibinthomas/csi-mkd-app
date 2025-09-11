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
  ClassFeedbackDto,
  ClassFeedbackResponseDto,
} from '../../../api/api-main-app/models';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import classListData from './class-list.json';

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
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  @ViewChild('formEl') formEl!: ElementRef<HTMLFormElement>;
  userDetails = signal<{ name: string; email: string }>({
    name: '',
    email: '',
  });

  userId = signal<string>('');
  classId = input<string>();
  instructor = signal<any>([]);
  today = new Date(); // current date

  constructor() {
    // Get userId from route params
    const routeUserId = this.route.snapshot.paramMap.get('userId');
    if (routeUserId) {
      this.userId.set(routeUserId);
    }

    // Effect to handle initial class selection and populate existing feedback
    effect(() => {
      const selectedClassId = this.feedbackForm.get('classTitle')?.value;
      const userFeedbackArray = this.userFeedbackResource.value();
      const currentUserId = this.userId();

      if (
        selectedClassId &&
        userFeedbackArray &&
        Array.isArray(userFeedbackArray) &&
        userFeedbackArray.length > 0 &&
        currentUserId
      ) {
        // Get the first (and likely only) feedback record for this user
        const userFeedback = userFeedbackArray[0];
        if (
          userFeedback &&
          userFeedback.premaritalRegistrationId === currentUserId
        ) {
          this.populateFormWithClassFeedback(
            userFeedback,
            selectedClassId.toString()
          );
        }
      }
    });

    // Effect to update user details and form when user data loads
    effect(() => {
      const userData = this.userDetailsResource.value();
      if (userData) {
        const parsedUser = JSON.parse(userData as string);
        this.userDetails.set({
          name: `${parsedUser.firstName} ${parsedUser.lastName}`,
          email: parsedUser.email,
        });
        this.feedbackForm.patchValue({
          premaritalRegistrationId: this.userId() || '',
        });
      }
    });
  }

  ratingLabels: Record<string, string> = {
    qualityRating: $localize`:@@overallQuality:Overall Quality`,
    relevanceRating: $localize`:@@contentRelevance:Content Relevance`,
    engagementRating: $localize`:@@presenterEngagement:Presenter Engagement`,
    organizationRating: $localize`:@@organization:Organization`,
  };

  protected readonly classTitles = signal<any>(classListData);

  protected readonly feedbackForm = this.fb.group({
    classTitle: [null as number | null, [Validators.required]], // required
    instructor: [null as number | null, Validators.required],
    date: [null as string | null, Validators.required], // required
    qualityRating: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(5)],
    ],
    relevanceRating: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(5)],
    ],
    engagementRating: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(5)],
    ],
    organizationRating: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(5)],
    ],
    valuable: [null as string | null, Validators.maxLength(500)], // optional
    improvements: [null as string | null, Validators.maxLength(500)], // optional
    comments: [null as string | null, Validators.maxLength(500)], // optional
    premaritalRegistrationId: [null as string | null], // optional, will be set programmatically
  });

  protected readonly isSubmitting = signal(false);
  protected readonly timezoneDisplay: string = $localize`DD/MM/YYYY | Time Zone: IST (UTC+05:30)`;

  // Resource to fetch user details from the API
  protected readonly userDetailsResource = rxResource({
    params: () => this.userId(),
    stream: ({ params: userId }) =>
      userId
        ? this.api
            .apiPremaritalregisterIdGet({
              id: userId,
            })
            .pipe(shareReplay(1))
        : of(null),
  });

  protected readonly completedFeedbackResource = rxResource({
    params: () => this.userId(),
    stream: ({ params: userId }) =>
      userId
        ? this.api
            .apiCosmosFeedbackCompletedRegistrationIdGet({
              registrationId: userId,
            })
            .pipe(shareReplay(1))
        : of(null), // Always return an observable
  });

  // Resource to fetch all user feedback by registration ID
  protected readonly userFeedbackResource = rxResource({
    params: () => this.userId(),
    stream: ({ params: userId }) =>
      userId
        ? this.api
            .apiCosmosFeedbackRegistrationRegistrationIdGet({
              registrationId: userId,
            })
            .pipe(shareReplay(1))
        : of(null),
  });

  protected readonly instructorListResource: any = rxResource({
    stream: () => this.api.apiInstructorsGet().pipe(shareReplay(1)),
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

    const formValue = this.feedbackForm.value;
    const classId = formValue.classTitle;

    // Create the class feedback payload using the new structure
    const payload: ClassFeedbackDto = {
      premaritalRegistrationId: this.userId() || '',
      name: this.userDetails().name || '',
      email: this.userDetails().email || '',
      feedbacks: {
        [classId!.toString()]: {
          date: formValue.date || '',
          instructorId: Number(formValue.instructor),
          ratings: {
            quality: Number(formValue.qualityRating),
            relevance: Number(formValue.relevanceRating),
            engagement: Number(formValue.engagementRating),
            organization: Number(formValue.organizationRating),
          },
          textResponses: {
            valuable: formValue.valuable || null,
            improvements: formValue.improvements || null,
            comments: formValue.comments || null,
          },
        },
      },
    };

    this.api.apiCosmosFeedbackPost({ body: payload }).subscribe({
      next: () => {
        // Navigate to the same route to refresh the page
        this.router
          .navigateByUrl('/', { skipLocationChange: true })
          .then(() => {
            this.router.navigate([
              this.route.snapshot.url.map((segment) => segment.path).join('/'),
            ]);

            this.snackBar.open(
              $localize`Feedback submitted successfully!`,
              'Close',
              {
                duration: 5000,
                horizontalPosition: 'right',
                verticalPosition: 'bottom',
              }
            );
          });
      },
      error: (err) => {
        this.snackBar.open(
          'Failed to submit feedback. Please try again later.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          }
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

  onClassTitleChange(): void {
    const selectedClassId = this.feedbackForm.get('classTitle')?.value;
    const userFeedbackArray = this.userFeedbackResource.value();
    const currentUserId = this.userId();

    if (
      selectedClassId &&
      userFeedbackArray &&
      Array.isArray(userFeedbackArray) &&
      userFeedbackArray.length > 0 &&
      currentUserId
    ) {
      // Get the first (and likely only) feedback record for this user
      const userFeedback = userFeedbackArray[0];
      if (
        userFeedback &&
        userFeedback.premaritalRegistrationId === currentUserId
      ) {
        this.populateFormWithClassFeedback(
          userFeedback,
          selectedClassId.toString()
        );
      } else {
        // Clear form fields except classTitle and premaritalRegistrationId if no existing feedback
        this.clearFeedbackFields();
      }
    } else {
      // Clear form fields except classTitle and premaritalRegistrationId if no data
      this.clearFeedbackFields();
    }
  }

  private clearFeedbackFields(): void {
    this.feedbackForm.patchValue({
      instructor: null,
      date: null,
      qualityRating: null,
      relevanceRating: null,
      engagementRating: null,
      organizationRating: null,
      valuable: null,
      improvements: null,
      comments: null,
    });
  }

  private populateFormWithClassFeedback(
    classFeedback: ClassFeedbackResponseDto,
    targetClassId: string
  ): void {
    // Check if the feedback object has the Feedbacks property (capital F) and the target class
    const feedbacks = classFeedback.feedbacks;

    if (feedbacks && feedbacks[targetClassId]) {
      const feedbackDetail = feedbacks[targetClassId];

      const formData = {
        instructor: feedbackDetail.instructorId || null,
        date: feedbackDetail.date || null,
        qualityRating: feedbackDetail.ratings?.quality || null,
        relevanceRating: feedbackDetail.ratings?.relevance || null,
        engagementRating: feedbackDetail.ratings?.engagement || null,
        organizationRating: feedbackDetail.ratings?.organization || null,
        valuable: feedbackDetail.textResponses?.valuable || null,
        improvements: feedbackDetail.textResponses?.improvements || null,
        comments: feedbackDetail.textResponses?.comments || null,
      };

      // Only update fields that are not currently being edited
      this.feedbackForm.patchValue(formData);
    } else {
      // Clear fields if no existing feedback for this class
      this.clearFeedbackFields();
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
