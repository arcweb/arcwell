import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ErrorResponseType } from '@schemas/error.schema';
import {
  deserializeFact,
  FactsResponseSchema,
  FactsResponseType,
  FactResponseSchema,
  FactResponseType,
  FactType,
  FactUpdateType,
} from '@shared/schemas/fact.schema';
import { catchError } from 'rxjs/operators';
import { defaultErrorResponseHandler } from '@shared/helpers/response-format.helper';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FactService {
  private http: HttpClient = inject(HttpClient);

  getFacts(
    limit?: number,
    offset?: number,
    sort?: string,
    order?: string,
    typeKey?: string,
  ): Observable<FactsResponseType[] | ErrorResponseType> {
    let params = new HttpParams();

    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    if (offset !== undefined) {
      params = params.set('offset', offset.toString());
    }
    if (typeKey) {
      params = params.set('typeKey', typeKey);
    }
    if (sort && order) {
      params = params.set('sort', sort);
      params = params.set('order', order);
    }

    return this.http
      .get<FactsResponseType>(`${environment.apiUrl}/facts`, { params })
      .pipe(
        map((response: FactsResponseType) => {
          FactsResponseSchema.parse(response);

          return {
            data: response.data.map((fact: FactType) => deserializeFact(fact)),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getFact(id: string): Observable<FactResponseType | ErrorResponseType> {
    return this.http
      .get<FactResponseType>(`${environment.apiUrl}/facts/${id}`)
      .pipe(
        map((response: FactResponseType) => {
          const parsedResponse = FactResponseSchema.parse(response);
          return { data: deserializeFact(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  update(
    fact: FactUpdateType,
  ): Observable<FactResponseType | ErrorResponseType> {
    return this.http
      .patch<FactResponseType>(`${environment.apiUrl}/facts/${fact.id}`, fact)
      .pipe(
        map((response: FactResponseType) => {
          const parsedResponse = FactResponseSchema.parse(response);
          return { data: deserializeFact(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  create(fact: FactType): Observable<FactResponseType | ErrorResponseType> {
    return this.http
      .post<FactResponseType>(`${environment.apiUrl}/facts`, fact)
      .pipe(
        map((response: FactResponseType) => {
          const parsedResponse = FactResponseSchema.parse(response);
          return { data: deserializeFact(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  delete(factId: string): Observable<void | ErrorResponseType> {
    return this.http.delete<void>(`${environment.apiUrl}/facts/${factId}`).pipe(
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }
}
