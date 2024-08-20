import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { ErrorResponseType } from '../schemas/error.schema';
import { ZodError } from 'zod';
import { PersonModel } from '@shared/models/person.model';
import {
  deserializePerson,
  PeopleResponseType,
  PersonResponseSchema,
  PersonResponseType,
  PersonType,
} from '@shared/schemas/person.schema';

const apiUrl = 'http://localhost:3333';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private http: HttpClient = inject(HttpClient);

  getAllPeople(
    limit?: number,
    offset?: number,
  ): Observable<{ data: PersonModel[]; meta: any }> {
    let params = new HttpParams();

    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    if (offset !== undefined) {
      params = params.set('offset', offset.toString());
    }

    return this.http
      .get<PeopleResponseType>(`${apiUrl}/people`, { params })
      .pipe(
        tap((response: PeopleResponseType | ErrorResponseType) => {
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
        map((response: PeopleResponseType) => ({
          data: response.data.map((person: PersonType) =>
            deserializePerson(person),
          ),
          meta: response.meta, // Add the meta field to the returned object
        })),
      );
  }

  getPerson(id: string): Observable<PersonModel | null> {
    return this.http.get<PersonResponseType>(`${apiUrl}/people/${id}`).pipe(
      tap((response: PersonResponseType | ErrorResponseType) => {
        // validate response is success
        if (response.errors && response.errors.length > 0) {
          // TODO: Refactor this to handle error status codes and errors array
          throw new Error(response.message);
        }
      }),
      map((response: PersonResponseType) => {
        try {
          const parsedResponse = PersonResponseSchema.parse(response);
          return parsedResponse.data
            ? deserializePerson(parsedResponse.data)
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

  // patchUser(user: UserUpdateType): Observable<UserModel | null> {
  //   return this.http
  //     .patch<UserResponseType>(`${apiUrl}/users/${user.id}`, user)
  //     .pipe(
  //       tap((response: UserResponseType | ErrorResponseType) => {
  //         // validate response is success
  //         if (response.errors && response.errors.length > 0) {
  //           // TODO: Refactor this to handle error status codes and errors array
  //           throw new Error(response.message);
  //         }
  //       }),
  //       map((response: UserResponseType) =>
  //         // validate the date we received is of the correct schema
  //         UserResponseSchema.parse(response),
  //       ),
  //       map(
  //         (response: UserResponseType) =>
  //           response.data && deserializeUser(response.data),
  //       ),
  //     );
  // }
}
