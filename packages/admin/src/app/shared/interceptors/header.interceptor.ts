import { HttpInterceptorFn } from '@angular/common/http';
import { AuthStore } from '@shared/store/auth.store';
import { inject } from '@angular/core';

export const HeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = inject(AuthStore).token();

  if (authToken) {
    // Clone the request and add the Authorization header
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + authToken),
    });

    return next(clonedReq);
  } else {
    // If no token, pass the request through unchanged
    return next(req);
  }
};
