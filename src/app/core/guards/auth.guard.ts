import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userId = localStorage.getItem('userId');

  if (userId) return true;
  return router.parseUrl('/login');
};
