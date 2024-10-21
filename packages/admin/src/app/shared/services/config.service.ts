import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { catchError, Observable } from 'rxjs';
import { defaultErrorResponseHandler } from '../helpers/response-format.helper';
import { HttpClient } from '@angular/common/http';
import { ConfigType } from '../schemas/config.schema';
import { ErrorResponseType } from '../schemas/error.schema';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private http: HttpClient = inject(HttpClient);

  getConfig(): Observable<ConfigType | ErrorResponseType> {
    return this.http.get(`${environment.apiUrl}/config`).pipe(
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }
}
