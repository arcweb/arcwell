import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { ZodError } from 'zod';

import { UserModel } from '../models/user.model';
import { ErrorResponseType } from '../schemas/error.schema';
import {
  deserializeUser,
  UserResponseSchema,
  UserResponseType,
  UsersResponseType,
  UserType,
  UserUpdateType,
} from '../schemas/user.schema';

const apiUrl = 'http://localhost:3333';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http: HttpClient = inject(HttpClient);

  constructor() {}

  getAllUsers(): Observable<UserModel[]> {
    return this.http.get<UsersResponseType>(`${apiUrl}/users`).pipe(
      tap((response: UsersResponseType | ErrorResponseType) => {
        // validate response is success
        if (response.errors && response.errors.length > 0) {
          // TODO: Refactor this to handle error status codes and errors array
          throw new Error(response.message);
        }
      }),
      // map((response: UsersResponseType) =>
      //   // validate the date we received is of the correct schema
      //   UsersResponseSchema.parse(response),
      // ),
      map((response: UsersResponseType) =>
        // deserialize the data
        response.data.map((user: UserType) => deserializeUser(user)),
      ),
    );
  }
  // // TODO: test this once we get auth working
  // postUser(user: UserModel): Observable<UserModel | null> {
  //   return this.http.post<UserResponseType>(`${apiUrl}/users`, user).pipe(
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

  getUser(id: string): Observable<UserModel | null> {
    return this.http.get<UserResponseType>(`${apiUrl}/users/${id}`).pipe(
      tap((response: UserResponseType | ErrorResponseType) => {
        // validate response is success
        if (response.errors && response.errors.length > 0) {
          // TODO: Refactor this to handle error status codes and errors array
          throw new Error(response.message);
        }
      }),
      map((response: UserResponseType) => {
        try {
          const parsedResponse = UserResponseSchema.parse(response);
          return parsedResponse.data
            ? deserializeUser(parsedResponse.data)
            : null;
        } catch (error) {
          if (error instanceof ZodError) {
            console.error('Zod validation error:', error.errors);
          } else {
            console.error('Unexpected error during validation:', error);
          }
          throw error;
        }
      }),
    );
  }

  patchUser(user: UserUpdateType): Observable<UserModel | null> {
    return this.http
      .patch<UserResponseType>(`${apiUrl}/users/${user.id}`, user)
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
}
