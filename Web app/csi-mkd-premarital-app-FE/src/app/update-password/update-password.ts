import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { CsiMkdPremaritalAppBeService } from '../../api/api-main-app/services';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-update-password',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './update-password.html',
})
export class UpdatePassword {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private api = inject(CsiMkdPremaritalAppBeService);

  loading = false;
  message = '';
  error = '';

  form: ReturnType<FormBuilder['group']>;

  constructor() {
    this.form = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  updatePassword() {
    if (this.form.invalid) {
      this.error = 'Please correct the errors before submitting.';
      return;
    }

    this.loading = true;
    this.message = '';
    this.error = '';
    this.api.apiAuthUpdatePasswordPost(this.form.value as any).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Password updated successfully.';
        this.loading = false;
        this.form.reset();
      },
      error: (err) => {
        this.error = err.error || 'Failed to update password';
        this.loading = false;
      },
    });
  }
}
