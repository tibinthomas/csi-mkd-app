import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CsiMkdPremaritalAppBeService } from '../../../api/services/csi-mkd-premarital-app-be.service';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-verification',
  imports: [MatInputModule, CommonModule, ReactiveFormsModule],
  templateUrl: './email-verification.html',
  styleUrl: './email-verification.scss',
})
export class EmailVerification {
  private fb = inject(FormBuilder);
  private csiMkdPremaritalAppBeService = inject(CsiMkdPremaritalAppBeService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  error = signal<string | null>(null);

  verifyEmail() {
    if (this.form.invalid) return;
    this.csiMkdPremaritalAppBeService
      .apiPremaritalregisterCheckEmailGet({ email: this.form.value.email! })
      .subscribe({
        next: (res) => {
          if (res) {
            console.log(res);
            // Store email in sessionStorage so feedback form can use it
            sessionStorage.setItem('feedbackEmail', this.form.value.email!);
            this.router.navigate(['/feedback-form']);
          } else {
            this.error.set('Email not found in registered list.');
          }
        },
        error: () => this.error.set('Something went wrong. Try again.'),
      });
  }
}
