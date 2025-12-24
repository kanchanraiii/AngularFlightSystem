import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const currentUrl = state?.url || '';

  if (auth.isAuthenticated() && !auth.isAdmin()) {
    if (auth.requiresPasswordChange() && !currentUrl.startsWith('/change-password')) {
      router.navigate(['/change-password'], { queryParams: { reason: 'password_expired' } });
      return false;
    }
    return true;
  }
  if (auth.isAdmin()) {
    router.navigate(['/admin']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
