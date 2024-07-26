import { Injectable, inject } from '@angular/core';
import {
  deserializeUser,
  UsersResponseType,
  UsersResponseSchema,
  UserType,
  UserResponseType,
  UserResponseSchema,
  UserUpdateType,
  serializeUser,
} from '../schemas/user.schema';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { UserModel } from '../models/user.model';
import { ErrorResponseType } from '../schemas/error.schema';

const apiUrl = 'http://localhost:3333';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http: HttpClient = inject(HttpClient);

  constructor() {}

  getAllUsers(): Observable<{ users: UserModel[]; count: number }> {
    return this.http.get<UsersResponseType>(`${apiUrl}/users`).pipe(
      tap((response: UsersResponseType | ErrorResponseType) => {
        // validate response is success
        if (response.status !== 'success') {
          throw new Error(response.message);
        }
      }),
      map((response: UsersResponseType) =>
        // validate the date we received is of the correct schema
        UsersResponseSchema.parse(response)
      ),
      map((response: UsersResponseType) => ({
        // deserialize the data
        users: response.data.users.map((user: UserType) =>
          deserializeUser(user)
        ),
        count: response.data.users.length,
      }))
    );
  }
  // TODO: test this oncce we get auth working
  postUser(user: UserModel): Observable<UserModel | null> {
    return this.http.post<UserResponseType>(`${apiUrl}/users`, user).pipe(
      tap((response: UserResponseType | ErrorResponseType) => {
        // validate response is success
        if (response.status !== 'success') {
          throw new Error(response.message);
        }
      }),
      map((response: UserResponseType) =>
        // validate the date we received is of the correct schema
        UserResponseSchema.parse(response)
      ),
      map(
        (response: UserResponseType) =>
          response.data.user && deserializeUser(response.data.user[0])
      )
    );
  }

  getUser(id: string): Observable<UserModel | null> {
    return this.http.get<UserResponseType>(`${apiUrl}/users/${id}`).pipe(
      tap((response: UserResponseType | ErrorResponseType) => {
        // validate response is success
        if (response.status !== 'success') {
          throw new Error(response.message);
        }
      }),
      map((response: UserResponseType) =>
        // validate the date we received is of the correct schema
        UserResponseSchema.parse(response)
      ),
      map(
        (response: UserResponseType) =>
          response.data.user && deserializeUser(response.data.user[0])
      )
    );
  }

  patchUser(user: UserUpdateType | UserModel): Observable<UserModel | null> {
    return this.http
      .patch<UserResponseType>(`${apiUrl}/users/${user.id}`, user)
      .pipe(
        tap((response: UserResponseType | ErrorResponseType) => {
          // validate response is success
          if (response.status !== 'success') {
            throw new Error(response.message);
          }
        }),
        map((response: UserResponseType) =>
          // validate the date we received is of the correct schema
          UserResponseSchema.parse(response)
        ),
        map(
          (response: UserResponseType) =>
            response.data.user && deserializeUser(response.data.user[0])
        )
      );
  }
}
