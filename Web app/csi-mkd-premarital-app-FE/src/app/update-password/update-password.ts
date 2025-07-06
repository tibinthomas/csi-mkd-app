import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../api/services';
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
    MatButtonModule
],
  templateUrl: './update-password.html',
})
export class UpdatePassword {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  loading = false;
  message = '';
  error = '';

  form: ReturnType<FormBuilder['group']>;

  constructor() {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  updatePassword() {
    if (this.form.invalid) return;
    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.error = 'New password and confirm password must match.';
      return;
    }

    this.loading = true;
    this.message = '';
    this.error = '';
    this.authService.apiAuthUpdatePasswordPost(this.form.value).subscribe({
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
