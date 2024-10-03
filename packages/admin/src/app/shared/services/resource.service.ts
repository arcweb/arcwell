import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { ErrorResponseType } from '@shared/schemas/error.schema';
import {
  deserializeResource,
  ResourceResponseSchema,
  ResourceResponseType,
  ResourcesCountType,
  ResourcesResponseSchema,
  ResourcesResponseType,
  ResourceUpdateType,
} from '@shared/schemas/resource.schema';
import { ResourceType } from '@app/shared/schemas/resource.schema';
import { defaultErrorResponseHandler } from '@shared/helpers/response-format.helper';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private http: HttpClient = inject(HttpClient);

  getResources(props: {
    limit?: number;
    offset?: number;
    sort?: string;
    order?: string;
    typeKey?: string;
    search?: [{ field: string; searchString: string }];
  }): Observable<ResourcesResponseType[] | ErrorResponseType> {
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
      .get<ResourcesResponseType>(`${environment.apiUrl}/resources`, { params })
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
      .get<ResourceResponseType>(`${environment.apiUrl}/resources/${id}`)
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
        `${environment.apiUrl}/resources/${resource.id}`,
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
      .post<ResourceResponseType>(`${environment.apiUrl}/resources`, resource)
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
      .delete<ResourceResponseType>(
        `${environment.apiUrl}/resources/${resourceId}`,
      )
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  count(): Observable<ResourcesCountType | ErrorResponseType> {
    return this.http
      .get<ResourcesCountType>(`${environment.apiUrl}/resources/count`)
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
