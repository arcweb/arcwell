import { Injectable, inject } from '@angular/core';
import {
  deserializeUser,
  UsersResponseType,
  UserType,
  UserResponseType,
  UserResponseSchema,
  UserUpdateType,
  UsersResponseSchema,
} from '@schemas/user.schema';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, tap } from 'rxjs';
import { UserModel } from '@shared/models';
import { ErrorResponseType } from '@schemas/error.schema';
import { defaultErrorResponseHandler } from '../helpers/response-format.helper';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http: HttpClient = inject(HttpClient);

  getAllUsers(
    limit?: number,
    offset?: number,
  ): Observable<UsersResponseType[] | ErrorResponseType> {
    let params = new HttpParams();

    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    if (offset !== undefined) {
      params = params.set('offset', offset.toString());
    }

    return this.http
      .get<UsersResponseType>(`${environment.apiUrl}/users`, { params })
      .pipe(
        map((response: UsersResponseType) => {
          UsersResponseSchema.parse(response);

          return {
            data: response.data.map((user: UserType) => deserializeUser(user)),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
  // // TODO: test this once we get auth working
  // postUser(user: UserModel): Observable<UserModel | null> {
  //   return this.http.post<UserResponseType>(`${environment.apiUrl}/users`, user).pipe(
  //     tap((response: UserResponseType | ErrorResponseType) => {
  //       // validate response is success
  //       if (response.errors && response.errors.length > 0) {
  //         // TODO: Refactor this to handle error status codes and errors array
  //         throw new Error(response.message);
  //       }
  //     }),
  //     map((response: UserResponseType) =>
  //       // validate the date we received is of the correct schema
  //       UserResponseSchema.parse(response),
  //     ),
  //     map(
  //       (response: UserResponseType) =>
  //         response.user && deserializeUser(response.user),
  //     ),
  //   );
  // }

  getUser(id: string): Observable<UserModel | ErrorResponseType> {
    return this.http
      .get<UserResponseType>(`${environment.apiUrl}/users/${id}`)
      .pipe(
        map((response: UserResponseType) => {
          const parsedResponse = UserResponseSchema.parse(response);
          return { data: deserializeUser(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  update(user: UserUpdateType): Observable<UserModel | ErrorResponseType> {
    return this.http
      .patch<UserResponseType>(`${environment.apiUrl}/users/${user.id}`, user)
      .pipe(
        tap((response: UserResponseType | ErrorResponseType) => {
          // validate response is success
          if (response.errors && response.errors.length > 0) {
            // TODO: Refactor this to handle error status codes and errors array
            throw new Error(response.message);
          }
        }),
        map((response: UserResponseType) =>
          // validate the date we received is of the correct schema
          UserResponseSchema.parse(response),
        ),
        map(
          (response: UserResponseType) =>
            response.data && deserializeUser(response.data),
        ),
      );
  }

  create(user: UserType): Observable<UserModel | ErrorResponseType> {
    return this.http
      .post<UserResponseType>(`${environment.apiUrl}/users`, user)
      .pipe(
        map((response: UserResponseType) => {
          const parsedResponse = UserResponseSchema.parse(response);
          return { data: deserializeUser(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
