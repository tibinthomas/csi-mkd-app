import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CsiMkdPremaritalAppBeService } from '../../api/api-main-app//services';
import { FeedbackDataService } from './feedback-data.service';
import { SessionsFallbackService } from '../core/services/sessions-fallback.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-feedback-questions',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './feedback-questions.html',
  styleUrl: './feedback-questions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackQuestions {
  emailForm: FormGroup;
  isVerified = signal(false);
  isLoading = signal(false);
  userDetails;
  private service = inject(CsiMkdPremaritalAppBeService);
  private feedbackDataService = inject(FeedbackDataService);
  private sessionsFallbackService = inject(SessionsFallbackService);
  private userId = null;
  
  // Session access control signals
  private currentUserSession = signal<any>(null);
  
  // Check if current date is within session period (extends 2 days after session end)
  readonly sessionAccessAllowed = computed(() => {
    const userDetails = this.feedbackDataService.userDetails();
    const session = this.currentUserSession();
    
    if (!userDetails || !session || !session.startDate || !session.endDate) {
      return false;
    }
    
    const now = new Date();
    const sessionStart = new Date(session.startDate);
    const sessionEnd = new Date(session.endDate);
    
    // Extend access period by 2 days after session end
    const extendedEndDate = new Date(sessionEnd);
    extendedEndDate.setDate(extendedEndDate.getDate() + 2);
    
    return now >= sessionStart && now <= extendedEndDate;
  });
  
  readonly sessionMessage = computed(() => {
    const userDetails = this.feedbackDataService.userDetails();
    const session = this.currentUserSession();
    
    if (!userDetails || !session) {
      return 'Session information not available.';
    }
    
    if (!session.startDate || !session.endDate) {
      return 'Session dates are not configured.';
    }
    
    const now = new Date();
    const sessionStart = new Date(session.startDate);
    const sessionEnd = new Date(session.endDate);
    
    // Calculate extended end date (2 days after session end)
    const extendedEndDate = new Date(sessionEnd);
    extendedEndDate.setDate(extendedEndDate.getDate() + 2);
    
    if (now < sessionStart) {
      return `Access will be available from ${sessionStart.toLocaleDateString()}.`;
    } else if (now > extendedEndDate) {
      return `Feedback access expired on ${extendedEndDate.toLocaleDateString()} (2 days after session ended).`;
    } else if (now > sessionEnd) {
      return `Session ended on ${sessionEnd.toLocaleDateString()}. Feedback access available until ${extendedEndDate.toLocaleDateString()}.`;
    }
    
    return '';
  });
  constructor(private fb: FormBuilder, private router: Router) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.userDetails = this.feedbackDataService.userDetails;
  }

  get emailControl() {
    return this.emailForm.get('email')!;
  }

  verifyEmail() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const emailValue = this.emailControl.value;
    this.isLoading.set(true);
    this.service
      .apiPremaritalregisterCheckEmailGet({
        email: emailValue,
      })
      .subscribe({
        next: (res: any) => {
          // Check if the response contains valid user details
          if (res && res.exists) {
            this.userId = res?.userId;
            this.isLoading.set(false);

            this.service
              .apiPremaritalregisterIdGet({
                id: res?.userId,
              })
              .subscribe({
                next: (userDetails: any) => {
                  const parsedDetails = JSON.parse(userDetails);
                  this.feedbackDataService.userDetails.set({
                    ...parsedDetails,
                    userId: this.userId,
                  });
                  
                  // Fetch session details for timing validation
                  if (parsedDetails.sessionId) {
                    this.fetchSessionDetails(parsedDetails.sessionId);
                  }
                  
                  this.isVerified.set(true);
                  this.emailControl.setErrors(null); // clear any previous errors
                },
                error: (err) => {
                  console.error('Error fetching user details:', err);
                  this.isVerified.set(false);
                  this.feedbackDataService.userDetails.set(null);
                  this.emailControl.setErrors({ serverError: true });
                },
              });
          } else {
            this.isVerified.set(false);
            this.isLoading.set(false);
            this.feedbackDataService.userDetails.set(null);
            this.emailControl.setErrors({ notRegistered: true });
          }
        },
        error: (err) => {
          console.error('Error verifying email:', err);
          this.isVerified.set(false);
          this.isLoading.set(false);
          this.feedbackDataService.userDetails.set(null);
          this.emailControl.setErrors({ serverError: true });
        },
      });
  }

  private fetchSessionDetails(sessionId: number): void {
    this.sessionsFallbackService
      .apiSessionconfigIdGet({ id: sessionId })
      .pipe(
        catchError((err) => {
          console.error('Error fetching session details:', err);
          return of(null);
        })
      )
      .subscribe((sessionData) => {
        this.currentUserSession.set(sessionData);
      });
  }
  
  goToForm(type: 'feedback' | 'questions') {
    // Check session access before allowing navigation
    if (!this.sessionAccessAllowed()) {
      // Don't navigate if session access is not allowed
      return;
    }
    
    this.router.navigate([`/${type}/${this.userId}`]);
  }
}
