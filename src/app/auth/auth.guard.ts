import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && !auth.isAdmin()) {
    return true;
  }
  if (auth.isAdmin()) {
    router.navigate(['/admin']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
