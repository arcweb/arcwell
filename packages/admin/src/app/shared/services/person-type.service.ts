import { Injectable, inject } from '@angular/core';
import {
  PersonTypeResponseType,
  PersonTypeType,
  deserializePersonType,
  PersonTypeResponseSchema,
  PersonTypesResponseType,
  PersonTypesResponseSchema,
  PersonTypeUpdateType,
} from '@schemas/person-type.schema';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { defaultErrorResponseHandler } from '../helpers/response-format.helper';
import { ErrorResponseType } from '@schemas/error.schema';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PersonTypeService {
  private http: HttpClient = inject(HttpClient);

  getPersonTypes(
    limit?: number,
    offset?: number,
    sort?: string,
    order?: string,
  ): Observable<PersonTypesResponseType[] | ErrorResponseType> {
    let params = new HttpParams();

    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    if (offset !== undefined) {
      params = params.set('offset', offset.toString());
    }
    if (sort && order) {
      params = params.set('sort', sort);
      params = params.set('order', order);
    }

    return this.http
      .get<PersonTypesResponseType>(`${environment.apiUrl}/person_types`, {
        params,
      })
      .pipe(
        map((response: PersonTypesResponseType) => {
          PersonTypesResponseSchema.parse(response);
          return {
            data: response.data.map((personType: PersonTypeType) =>
              deserializePersonType(personType),
            ),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getPersonType(
    id: string,
  ): Observable<PersonTypeResponseType | ErrorResponseType> {
    return this.http
      .get<PersonTypeResponseType>(`${environment.apiUrl}/person_types/${id}`)
      .pipe(
        map((response: PersonTypeResponseType) => {
          const parsedResponse = PersonTypeResponseSchema.parse(response);
          return { data: deserializePersonType(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  update(
    person: PersonTypeUpdateType,
  ): Observable<PersonTypeResponseType | ErrorResponseType> {
    return this.http
      .patch<PersonTypeResponseType>(
        `${environment.apiUrl}/person_types/${person.id}`,
        person,
      )
      .pipe(
        map((response: PersonTypeResponseType) => {
          const parsedResponse = PersonTypeResponseSchema.parse(response);
          return { data: deserializePersonType(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  create(
    personType: PersonTypeType,
  ): Observable<PersonTypeResponseType | ErrorResponseType> {
    return this.http
      .post<PersonTypeResponseType>(
        `${environment.apiUrl}/person_types`,
        personType,
      )
      .pipe(
        map((response: PersonTypeResponseType) => {
          const parsedResponse = PersonTypeResponseSchema.parse(response);
          return { data: deserializePersonType(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  delete(
    personTypeId: string,
  ): Observable<PersonTypeResponseType | ErrorResponseType> {
    return this.http
      .delete<PersonTypeResponseType>(
        `${environment.apiUrl}/person_types/${personTypeId}`,
      )
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
