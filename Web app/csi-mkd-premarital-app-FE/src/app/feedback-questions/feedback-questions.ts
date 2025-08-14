import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { PremaritalRegisterDto } from '../../api/models/premarital-register-dto';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CsiMkdPremaritalAppBeService } from '../../api/services';
import { FeedbackDataService } from './feedback-data.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-feedback-questions',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
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
  private userId = null;
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
          if (res && res.Exists) {
            this.userId = res?.UserId;
            this.isLoading.set(false);

            this.service
              .apiPremaritalregisterIdGet({
                id: res?.UserId,
              })
              .subscribe({
                next: (userDetails: any) => {
                  this.feedbackDataService.userDetails.set({
                    ...JSON.parse(userDetails),
                    userId: this.userId,
                  });
                  this.isVerified.set(true);
                  console.log('Email verified successfully.');
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
            console.log('Email not found in registered list.');
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

  goToForm(type: 'feedback' | 'questions') {
    this.router.navigate([`/${type}/${this.userId}`]);
  }
}
