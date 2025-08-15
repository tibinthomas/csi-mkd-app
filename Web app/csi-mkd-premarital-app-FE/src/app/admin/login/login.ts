import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.html',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    NgOptimizedImage,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLogin {
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  loginLabel = computed(() =>
    this.loading()
      ? $localize`:@@loggingIn:Logging in...`
      : $localize`:@@login:Login`
  );

  protected readonly loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    const { username, password } = this.loginForm.value;

    this.authService.login({ username: username ?? '', password: password ?? '' }).subscribe({
      next: (res) => {
        this.router.navigate(['/admin/dashboard']);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Login failed. Please check your credentials.');
        this.loading.set(false);
      },
    });
  }
}
