import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ErrorResponseType } from '@schemas/error.schema';
import {
  deserializeCohort,
  CohortsResponseSchema,
  CohortResponseSchema,
  CohortsResponseType,
  CohortResponseType,
  CohortType,
  CohortUpdateType,
} from '@shared/schemas/cohort.schema';
import { catchError } from 'rxjs/operators';
import { defaultErrorResponseHandler } from '@shared/helpers/response-format.helper';

const apiUrl = 'http://localhost:3333';

@Injectable({
  providedIn: 'root',
})
export class CohortService {
  private http: HttpClient = inject(HttpClient);

  getCohorts(
    limit?: number,
    offset?: number
  ): Observable<CohortsResponseType[] | ErrorResponseType> {
    let params = new HttpParams();

    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    if (offset !== undefined) {
      params = params.set('offset', offset.toString());
    }

    return this.http
      .get<CohortsResponseType>(`${apiUrl}/cohorts`, { params })
      .pipe(
        map((response: CohortsResponseType) => {
          CohortsResponseSchema.parse(response);

          return {
            data: response.data.map((cohort: CohortType) =>
              deserializeCohort(cohort),
            ),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getCohort(id: string): Observable<CohortResponseType | ErrorResponseType> {
    return this.http.get<CohortResponseType>(`${apiUrl}/cohorts/${id}`).pipe(
      map((response: CohortResponseType) => {
        const parsedResponse = CohortResponseSchema.parse(response);
        return { data: deserializeCohort(parsedResponse.data) };
      }),
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  update(
    cohort: CohortUpdateType,
  ): Observable<CohortResponseType | ErrorResponseType> {
    return this.http
      .patch<CohortResponseType>(`${apiUrl}/cohorts/${cohort.id}`, cohort)
      .pipe(
        map((response: CohortResponseType) => {
          const parsedResponse = CohortResponseSchema.parse(response);
          return { data: deserializeCohort(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  create(
    cohort: CohortType,
  ): Observable<CohortResponseType | ErrorResponseType> {
    return this.http.post<CohortResponseType>(`${apiUrl}/cohorts`, cohort).pipe(
      map((response: CohortResponseType) => {
        const parsedResponse = CohortResponseSchema.parse(response);
        return { data: deserializeCohort(parsedResponse.data) };
      }),
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  delete(cohortId: string): Observable<void | ErrorResponseType> {
    return this.http.delete<void>(`${apiUrl}/cohorts/${cohortId}`).pipe(
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }
}
