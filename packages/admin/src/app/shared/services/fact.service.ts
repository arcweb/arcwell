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

const apiUrl = 'http://localhost:3333';

@Injectable({
  providedIn: 'root',
})
export class FactService {
  private http: HttpClient = inject(HttpClient);

  getFacts(
    limit?: number,
    offset?: number,
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

    return this.http.get<FactsResponseType>(`${apiUrl}/facts`, { params }).pipe(
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
    return this.http.get<FactResponseType>(`${apiUrl}/facts/${id}`).pipe(
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
      .patch<FactResponseType>(`${apiUrl}/facts/${fact.id}`, fact)
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
    return this.http.post<FactResponseType>(`${apiUrl}/facts`, fact).pipe(
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
    return this.http.delete<void>(`${apiUrl}/facts/${factId}`).pipe(
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }
}
