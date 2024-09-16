import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { ErrorResponseType } from '@shared/schemas/error.schema';
import {
  deserializeResource,
  ResourceResponseSchema,
  ResourceResponseType,
  ResourcesResponseSchema,
  ResourcesResponseType,
  ResourceUpdateType,
} from '@shared/schemas/resource.schema';
import { ResourceType } from '@app/shared/schemas/resource.schema';
import { defaultErrorResponseHandler } from '@shared/helpers/response-format.helper';

const apiUrl = 'http://localhost:3333';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private http: HttpClient = inject(HttpClient);

  getResources(
    limit?: number,
    offset?: number,
    sort?: string,
    order?: string,
    typeKey?: string,
  ): Observable<ResourcesResponseType[] | ErrorResponseType> {
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
      .get<ResourcesResponseType>(`${apiUrl}/resources`, { params })
      .pipe(
        map((response: ResourcesResponseType) => {
          ResourcesResponseSchema.parse(response);

          return {
            data: response.data.map((resource: ResourceType) =>
              deserializeResource(resource),
            ),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getResource(
    id: string,
  ): Observable<ResourceResponseType | ErrorResponseType> {
    return this.http
      .get<ResourceResponseType>(`${apiUrl}/resources/${id}`)
      .pipe(
        map((response: ResourceResponseType) => {
          const resourceResponse = ResourceResponseSchema.parse(response);
          return { data: deserializeResource(resourceResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  update(
    resource: ResourceUpdateType,
  ): Observable<ResourceResponseType | ErrorResponseType> {
    return this.http
      .patch<ResourceResponseType>(
        `${apiUrl}/resources/${resource.id}`,
        resource,
      )
      .pipe(
        map((response: ResourceResponseType) => {
          const parsedResponse = ResourceResponseSchema.parse(response);
          return { data: deserializeResource(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  create(
    resource: ResourceType,
  ): Observable<ResourceResponseType | ErrorResponseType> {
    return this.http
      .post<ResourceResponseType>(`${apiUrl}/resources`, resource)
      .pipe(
        map((response: ResourceResponseType) => {
          const parsedResponse = ResourceResponseSchema.parse(response);
          return { data: deserializeResource(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  delete(
    resourceId: string,
  ): Observable<ResourceResponseType | ErrorResponseType> {
    return this.http
      .delete<ResourceResponseType>(`${apiUrl}/resources/${resourceId}`)
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
