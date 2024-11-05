import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ErrorResponseType } from '../schemas/error.schema';
import { environment } from 'environments/environment';
import { defaultErrorResponseHandler } from '../helpers/response-format.helper';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BulkService {
  private http: HttpClient = inject(HttpClient);

  uploadCsv(
    apiRoute: string,
    file: File,
  ): Observable<ErrorResponseType | null> {
    const url = `${environment.apiUrl}/${apiRoute}/bulk`;
    return this.http.post(url, { file: file }).pipe(
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }
}
