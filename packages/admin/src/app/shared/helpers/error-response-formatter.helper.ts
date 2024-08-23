import { Observable, of, throwError } from 'rxjs';
import { ErrorResponseType } from '@shared/schemas/error.schema';
import { ZodError } from 'zod';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Formats Zod validation and HttpErrorResponse errors into standard response.  Throws an excpetion if format is not recognized.
 * @returns Observable<ErrorResponseType>
 * @param error
 */
export function defaultErrorResponseHandler(
  error: any,
): Observable<ErrorResponseType> {
  if (error instanceof ZodError) {
    return of({ errors: error.errors });
  } else if (error instanceof HttpErrorResponse) {
    return of({ errors: error.error.errors });
  } else {
    return throwError(() => error); // Error type is unhandled, best to blow things up
  }
}
