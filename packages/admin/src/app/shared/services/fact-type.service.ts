import { Injectable, inject } from '@angular/core';
import {
  FactTypeResponseType,
  FactTypeType,
  deserializeFactType,
  FactTypeResponseSchema,
  FactTypesResponseType,
  FactTypesResponseSchema,
  FactTypeUpdateType,
} from '@schemas/fact-type.schema';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { defaultErrorResponseHandler } from '../helpers/response-format.helper';
import { ErrorResponseType } from '@schemas/error.schema';

const apiUrl = 'http://localhost:3333';

@Injectable({
  providedIn: 'root',
})
export class FactTypeService {
  private http: HttpClient = inject(HttpClient);

  getFactTypes(
    limit?: number,
    offset?: number,
  ): Observable<FactTypesResponseType[] | ErrorResponseType> {
    let params = new HttpParams();

    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    if (offset !== undefined) {
      params = params.set('offset', offset.toString());
    }

    return this.http
      .get<FactTypesResponseType>(`${apiUrl}/fact_types`, { params })
      .pipe(
        map((response: FactTypesResponseType) => {
          FactTypesResponseSchema.parse(response);
          return {
            data: response.data.map((factType: FactTypeType) =>
              deserializeFactType(factType),
            ),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getFactType(
    id: string,
  ): Observable<FactTypeResponseType | ErrorResponseType> {
    return this.http
      .get<FactTypeResponseType>(`${apiUrl}/fact_types/${id}`)
      .pipe(
        map((response: FactTypeResponseType) => {
          const parsedResponse = FactTypeResponseSchema.parse(response);
          return { data: deserializeFactType(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  update(
    fact: FactTypeUpdateType,
  ): Observable<FactTypeResponseType | ErrorResponseType> {
    return this.http
      .patch<FactTypeResponseType>(`${apiUrl}/fact_types/${fact.id}`, fact)
      .pipe(
        map((response: FactTypeResponseType) => {
          const parsedResponse = FactTypeResponseSchema.parse(response);
          return { data: deserializeFactType(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  create(
    factType: FactTypeType,
  ): Observable<FactTypeResponseType | ErrorResponseType> {
    return this.http
      .post<FactTypeResponseType>(`${apiUrl}/fact_types`, factType)
      .pipe(
        map((response: FactTypeResponseType) => {
          const parsedResponse = FactTypeResponseSchema.parse(response);
          return { data: deserializeFactType(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  delete(
    factTypeId: string,
  ): Observable<FactTypeResponseType | ErrorResponseType> {
    return this.http
      .delete<FactTypeResponseType>(`${apiUrl}/fact_types/${factTypeId}`)
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
