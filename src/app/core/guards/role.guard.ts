import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/user.model';

export function roleGuard(role: UserRole): CanActivateFn {
  return (route, state) => {
    const router = inject(Router);
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (!userId) return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    if (userRole !== role) {
      if (userRole === 'admin') return router.parseUrl('/app/admin');
      return router.parseUrl('/app/home');
    }
    return true;
  };
}
