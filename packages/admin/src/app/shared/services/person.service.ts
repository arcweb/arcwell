import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ErrorResponseType } from '../schemas/error.schema';
import {
  deserializePerson,
  PeopleResponseSchema,
  PeopleResponseType,
  PersonResponseSchema,
  PersonResponseType,
  PersonType,
  PersonUpdateType,
} from '@shared/schemas/person.schema';
import { catchError } from 'rxjs/operators';
import { defaultErrorResponseHandler } from '@shared/helpers/response-format.helper';

const apiUrl = 'http://localhost:3333';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private http: HttpClient = inject(HttpClient);

  getAllPeople(
    limit?: number,
    offset?: number,
  ): Observable<PeopleResponseType[] | ErrorResponseType> {
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
        map((response: PeopleResponseType) => {
          PeopleResponseSchema.parse(response);

          return {
            data: response.data.map((person: PersonType) =>
              deserializePerson(person),
            ),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getPerson(id: string): Observable<PersonResponseType | ErrorResponseType> {
    return this.http.get<PersonResponseType>(`${apiUrl}/people/${id}`).pipe(
      map((response: PersonResponseType) => {
        const parsedResponse = PersonResponseSchema.parse(response);
        return { data: deserializePerson(parsedResponse.data) };
      }),
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  update(
    person: PersonUpdateType,
  ): Observable<PersonResponseType | ErrorResponseType> {
    return this.http
      .patch<PersonResponseType>(`${apiUrl}/people/${person.id}`, person)
      .pipe(
        map((response: PersonResponseType) => {
          const parsedResponse = PersonResponseSchema.parse(response);
          return { data: deserializePerson(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  // TODO: Work in progress, refactor   - tgetz
  // save(person: PersonModel): Observable<PersonModel | null> {
  //   return this.http.post<PersonResponseType>(`${apiUrl}/people`, person).pipe(
  //     tap((response: PersonResponseType | ErrorResponseType) => {
  //       // validate response is success
  //       if (response.errors && response.errors.length > 0) {
  //         // TODO: Refactor this to handle error status codes and errors array
  //         throw new Error(response.message);
  //       }
  //     }),
  //     map((response: PersonResponseType) =>
  //       // validate the date we received is of the correct schema
  //       PersonResponseSchema.parse(response.data),
  //     ),
  //     map((response: PersonResponseType) => {
  //       try {
  //         const parsedResponse = PersonResponseSchema.parse(response);
  //         return parsedResponse.data
  //           ? deserializePerson(parsedResponse.data)
  //           : null;
  //       } catch (error) {
  //         if (error instanceof ZodError) {
  //           console.error('Zod validation error:', error.errors);
  //         } else {
  //           console.error('Unexpected error during validation:', error);
  //         }
  //         throw error;
  //       }
  //     }),
  //   );
  // }
}
