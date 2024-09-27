import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ErrorResponseType } from '@schemas/error.schema';
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
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private http: HttpClient = inject(HttpClient);

  getPeople(props: {
    limit?: number;
    offset?: number;
    sort?: string;
    order?: string;
    typeKey?: string;
    notInCohort?: string;
    search?: [{ field: string; searchString: string }];
  }): Observable<PeopleResponseType[] | ErrorResponseType> {
    let params = new HttpParams();

    if (props.limit !== undefined) {
      params = params.set('limit', props.limit.toString());
    }
    if (props.offset !== undefined) {
      params = params.set('offset', props.offset.toString());
    }
    if (props.typeKey) {
      params = params.set('typeKey', props.typeKey);
    }
    if (props.notInCohort) {
      params = params.set('notInCohort', props.notInCohort);
    }

    if (props.search && props.search.length > 0) {
      props.search.forEach(searchItem => {
        if (searchItem.field && searchItem.searchString) {
          // Format: search[field]=searchString
          params = params.set(
            `search[${searchItem.field}]`,
            searchItem.searchString,
          );
        }
      });
    }
    if (props.sort && props.order) {
      params = params.set('sort', props.sort);
      params = params.set('order', props.order);
    }

    return this.http
      .get<PeopleResponseType>(`${environment.apiUrl}/people`, { params })
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
    return this.http
      .get<PersonResponseType>(`${environment.apiUrl}/people/${id}`)
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

  getPersonWithCohorts(
    id: string,
    cohortLimit?: number,
    cohortOffset?: number,
  ): Observable<PersonResponseType | ErrorResponseType> {
    let params = new HttpParams();

    if (cohortLimit !== undefined) {
      params = params.set('cohortLimit', cohortLimit.toString());
    }
    if (cohortOffset !== undefined) {
      params = params.set('cohortOffset', cohortOffset.toString());
    }

    return this.http
      .get<PersonResponseType>(`${environment.apiUrl}/people/${id}/cohorts`, { params })
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

  update(
    person: PersonUpdateType,
  ): Observable<PersonResponseType | ErrorResponseType> {
    return this.http
      .patch<PersonResponseType>(
        `${environment.apiUrl}/people/${person.id}`,
        person,
      )
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

  create(
    person: PersonType,
  ): Observable<PersonResponseType | ErrorResponseType> {
    return this.http
      .post<PersonResponseType>(`${environment.apiUrl}/people`, person)
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

  delete(personId: string): Observable<void | ErrorResponseType> {
    return this.http
      .delete<void>(`${environment.apiUrl}/people/${personId}`)
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  attachCohort(
    personId: string,
    cohortId: string,
  ): Observable<void | ErrorResponseType> {
    const payload = {
      cohortIds: [cohortId],
    };
    return this.http
      .post<void>(`${environment.apiUrl}/people/${personId}/attach`, payload)
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  detachCohort(
    personId: string,
    cohortId: string,
  ): Observable<void | ErrorResponseType> {
    const payload = {
      cohortIds: [cohortId],
    };
    return this.http
      .request<void>('delete', `${environment.apiUrl}/people/${personId}/detach`, {
        body: payload,
      })
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
