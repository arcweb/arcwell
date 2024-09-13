import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, tap } from 'rxjs';
import { Credentials } from '@shared/interfaces/credentials';
import { HttpClient } from '@angular/common/http';
import { UserModel } from '@shared/models/user.model';
import { UserResponseType, deserializeUser } from '@shared/schemas/user.schema';
import { ErrorResponseType } from '@shared/schemas/error.schema';
import {
  LoginResponseSchema,
  LoginResponseType,
} from '@shared/schemas/login.schema';
import { defaultErrorResponseHandler } from '../helpers/response-format.helper';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http: HttpClient = inject(HttpClient);

  apiUrl = 'http://localhost:3333';

  loginTo(credentials: Credentials): Observable<{
    token: { type: string; value: string };
    user: UserModel;
  } | null> {
    return this.http
      .post<LoginResponseType>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response: LoginResponseType | ErrorResponseType) => {
          // validate response is success
          if (response.errors && response.errors.length > 0) {
            // TODO: Refactor this to handle error status codes and errors array
            throw new Error(response.message);
          }
        }),
        map((response: LoginResponseType) =>
          // validate the date we received is of the correct schema
          LoginResponseSchema.parse(response),
        ),
        // TODO: deserialize User in response
        map((response: LoginResponseType) => {
          return {
            token: response.data.token,
            user: deserializeUser(response.data.user),
          };
        }),
      );
  }

  logout(): Observable<LoginResponseType | ErrorResponseType> {
    return this.http
      .delete<LoginResponseType>(`${this.apiUrl}/auth/logout`)
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  me(): Observable<UserResponseType | ErrorResponseType> {
    return this.http.get<UserResponseType>(`${this.apiUrl}/auth/me`).pipe(
      map(response => {
        return deserializeUser(response.data);
      }),
    );
  }
}
