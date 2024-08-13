import { Injectable, inject } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Credentials } from '@shared/interfaces/credentials';
import { HttpClient } from '@angular/common/http';
import { UserModel } from '@shared/models/user.model';
import { deserializeUser } from '@shared/schemas/user.schema';
import { ErrorResponseType } from '@shared/schemas/error.schema';
import {
  LoginResponseSchema,
  LoginResponseType,
} from '@shared/schemas/login.schema';

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
}
