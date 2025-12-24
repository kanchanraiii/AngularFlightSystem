import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const passwordFreshGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  if (auth.isAdmin()) {
    return true;
  }

  if (auth.requiresPasswordChange() && !state.url.startsWith('/change-password')) {
    return router.createUrlTree(['/change-password'], {
      queryParams: { reason: 'password_expired' }
    });
  }

  return true;
};
