import { Observable, of, throwError } from 'rxjs';
import { ErrorResponseType } from '@shared/schemas/error.schema';
import { ZodError, ZodIssueBase } from 'zod';
import { HttpErrorResponse } from '@angular/common/http';

function mapZodIssueToErrorResponse(error: ZodIssueBase): ErrorResponseType {
  return {
    title: error.message ? error.message : 'No message provided',
    detail: '[' + error.path.join(',') + ']',
    code: 'VALIDATION_ERROR',
  };
}

/**
 * Formats Zod validation and HttpErrorResponse errors into standard response.  Throws an excpetion if format is not recognized.
 * @returns Observable<ErrorResponseType>
 * @param error
 */
export function defaultErrorResponseHandler(
  error: any,
): Observable<ErrorResponseType> {
  if (error instanceof ZodError) {
    const parsedErrors: ErrorResponseType[] = error.issues.map(
      mapZodIssueToErrorResponse,
    );
    return of({ errors: parsedErrors });
  } else if (error instanceof HttpErrorResponse) {
    return of({ errors: error.error.errors });
  } else {
    return throwError(() => error); // Error type is unhandled, best to blow things up
  }
}
