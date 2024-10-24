import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, tap } from 'rxjs';
import { Credentials } from '@shared/interfaces/credentials';
import { HttpClient } from '@angular/common/http';
import { UserModel } from '@shared/models/user.model';
import {
  UserResponseType,
  UsersResponseType,
  deserializeUser,
} from '@shared/schemas/user.schema';
import { ErrorResponseType } from '@shared/schemas/error.schema';
import {
  LoginResponseSchema,
  LoginResponseType,
} from '@shared/schemas/login.schema';
import { defaultErrorResponseHandler } from '../helpers/response-format.helper';
import { environment } from '../../../environments/environment';
import { ResetType } from '@schemas/password-reset.schema';
import { ChangeType } from '@schemas/password-change.schema';
import { SetType } from '../schemas/pasword-set.schema';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http: HttpClient = inject(HttpClient);

  apiUrl = environment.apiUrl;

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

  sendPasswordReset(email: string, host: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/forgot`, { email, host });
  }

  resetPassword(
    reset: ResetType,
  ): Observable<UserResponseType | ErrorResponseType> {
    return this.http
      .post<UsersResponseType>(`${this.apiUrl}/auth/reset`, {
        ...reset,
      })
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  changePassword(
    change: ChangeType,
  ): Observable<UserResponseType | ErrorResponseType> {
    return this.http
      .post<UserResponseType>(`${this.apiUrl}/auth/change`, { ...change })
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  setPassword(set: SetType): Observable<UserResponseType | ErrorResponseType> {
    return this.http
      .post<UserResponseType>(`${this.apiUrl}/auth/set`, {
        ...set,
      })
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
