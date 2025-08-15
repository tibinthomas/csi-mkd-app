import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Route guard that protects admin routes requiring authentication.
 * Redirects unauthenticated users to the login page.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Store the attempted URL for post-login redirection
  const returnUrl = state.url;
  if (returnUrl !== '/admin/login') {
    return router.createUrlTree(['/admin/login'], { 
      queryParams: { returnUrl } 
    });
  }

  return router.createUrlTree(['/admin/login']);
};
