import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { defaultErrorResponseHandler } from '../helpers/response-format.helper';
import { ErrorResponseType } from '../schemas/error.schema';

const apiUrl = 'http://localhost:3333';
@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private http: HttpClient = inject(HttpClient);

  sendEmail(
    emailAddress: string,
    template = '',
  ): Observable<void | ErrorResponseType> {
    return this.http
      .post<void>(`${apiUrl}/email`, {
        email: emailAddress,
        template: template,
      })
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
