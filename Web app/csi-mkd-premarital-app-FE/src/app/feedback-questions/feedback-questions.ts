import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CsiMkdPremaritalAppBeService } from '../../api/services';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-feedback-questions',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './feedback-questions.html',
  styleUrl: './feedback-questions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackQuestions {
  emailForm: FormGroup;
  isVerified = false;
  private service = inject(CsiMkdPremaritalAppBeService);

  constructor(private fb: FormBuilder, private router: Router) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
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

    this.service
      .apiPremaritalregisterCheckEmailGet({ email: emailValue })
      .subscribe({
        next: (res) => {
          if (res) {
            console.log('Email verified:', res);
            this.isVerified = true;
            this.emailControl.setErrors(null); // clear any previous errors
          } else {
            console.log('Email not found in registered list.');
            this.isVerified = false;
            this.emailControl.setErrors({ notRegistered: true });
          }
        },
        error: (err) => {
          console.error('Error verifying email:', err);
          this.isVerified = false;
          this.emailControl.setErrors({ serverError: true });
        },
      });
  }

  goToForm(type: 'feedback' | 'questions') {
    this.router.navigate([`/${type}`]);
  }
}
