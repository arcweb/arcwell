import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthStore } from '@shared/store/auth.store';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const HeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.token()) {
    // Clone the request and add the Authorization header
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + authStore.token()),
    });

    return next(clonedReq).pipe(
      catchError(error => {
        if ([401].includes(error.status)) {
          authStore.clearStore();
          authStore.clearStorage();
          router.navigate(['']);
        }
        return throwError(() => error);
      }),
    );
  } else {
    // If no token, pass the request through unchanged
    return next(req);
  }
};
