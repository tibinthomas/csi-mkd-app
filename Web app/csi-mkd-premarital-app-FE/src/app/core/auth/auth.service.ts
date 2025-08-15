import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

interface LoginResponse {
  readonly token: string;
  readonly username: string;
}

interface AuthState {
  readonly isAuthenticated: boolean;
  readonly token: string | null;
  readonly username: string | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${API_ROOT_URL}/api/auth`;
  private readonly tokenKey = 'auth_token';
  private readonly usernameKey = 'auth_username';

  private readonly _authState = signal<AuthState>({
    isAuthenticated: this.hasValidToken(),
    token: this.getStoredToken(),
    username: this.getStoredUsername(),
    isLoading: false,
    error: null,
  });

  readonly authState = computed(() => this._authState());
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
  readonly isLoading = computed(() => this._authState().isLoading);
  readonly username = computed(() => this._authState().username);
  readonly error = computed(() => this._authState().error);

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    this.updateAuthState({ isLoading: true, error: null });

    return this.http.post<LoginResponse>(
      `${this.baseUrl}/login`,
      credentials
    ).pipe(
      tap((response) => {
        this.setTokens(response.token, response.username);
        this.updateAuthState({
          isAuthenticated: true,
          token: response.token,
          username: response.username,
          isLoading: false,
          error: null,
        });
      }),
      catchError((error: HttpErrorResponse) => {
        const errorMessage = this.extractErrorMessage(error);
        this.updateAuthState({
          isAuthenticated: false,
          token: null,
          username: null,
          isLoading: false,
          error: errorMessage,
        });
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    this.clearTokens();
    this.updateAuthState({
      isAuthenticated: false,
      token: null,
      username: null,
      isLoading: false,
      error: null,
    });
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return this._authState().token;
  }

  isLoggedIn(): boolean {
    return this._authState().isAuthenticated && this.hasValidToken();
  }

  clearError(): void {
    this.updateAuthState({ error: null });
  }

  private updateAuthState(updates: Partial<AuthState>): void {
    this._authState.update(current => ({ ...current, ...updates }));
  }

  private setTokens(token: string, username: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.usernameKey, username);
    } catch (error) {
      console.error('Failed to store authentication tokens:', error);
    }
  }

  private clearTokens(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.usernameKey);
    } catch (error) {
      console.error('Failed to clear authentication tokens:', error);
    }
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Failed to retrieve token from storage:', error);
      return null;
    }
  }

  private getStoredUsername(): string | null {
    try {
      return localStorage.getItem(this.usernameKey);
    } catch (error) {
      console.error('Failed to retrieve username from storage:', error);
      return null;
    }
  }

  private hasValidToken(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      console.warn('Invalid token format:', error);
      return false;
    }
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    
    switch (error.status) {
      case 401:
        return 'Invalid username or password';
      case 403:
        return 'Access forbidden';
      case 429:
        return 'Too many login attempts. Please try again later';
      case 500:
        return 'Server error. Please try again later';
      default:
        return 'Login failed. Please try again';
    }
  }
}
