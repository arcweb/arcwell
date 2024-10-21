import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@shared/store/auth.store';

export const isAuthenticatedGuard = (): CanActivateFn => {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (authStore.currentUser()) {
      return true;
    }

    return router.parseUrl('/login');
  };
};
