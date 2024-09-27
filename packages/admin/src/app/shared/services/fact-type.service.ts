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
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FactTypeService {
  private http: HttpClient = inject(HttpClient);

  getFactTypes(
    limit?: number,
    offset?: number,
    sort?: string,
    order?: string,
  ): Observable<FactTypesResponseType[] | ErrorResponseType> {
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
      .get<FactTypesResponseType>(`${environment.apiUrl}/fact_types`, {
        params,
      })
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
      .get<FactTypeResponseType>(`${environment.apiUrl}/fact_types/${id}`)
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
      .patch<FactTypeResponseType>(
        `${environment.apiUrl}/fact_types/${fact.id}`,
        fact,
      )
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
      .post<FactTypeResponseType>(`${environment.apiUrl}/fact_types`, factType)
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
      .delete<FactTypeResponseType>(
        `${environment.apiUrl}/fact_types/${factTypeId}`,
      )
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
