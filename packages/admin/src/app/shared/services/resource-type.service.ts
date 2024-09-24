import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { ErrorResponseType } from '@shared/schemas/error.schema';
import {
  deserializeResourceType,
  ResourceTypeResponseSchema,
  ResourceTypeResponseType,
  ResourceTypesResponseSchema,
  ResourceTypesResponseType,
  ResourceTypeUpdateType,
} from '@shared/schemas/resource-type.schema';
import { ResourceTypeType } from '@app/shared/schemas/resource-type.schema';
import { defaultErrorResponseHandler } from '@shared/helpers/response-format.helper';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResourceTypeService {
  private http: HttpClient = inject(HttpClient);

  getResourceTypes(
    limit?: number,
    offset?: number,
    sort?: string,
    order?: string,
  ): Observable<ResourceTypesResponseType[] | ErrorResponseType> {
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
      .get<ResourceTypesResponseType>(`${environment.apiUrl}/resource_types`, {
        params,
      })
      .pipe(
        map((response: ResourceTypesResponseType) => {
          ResourceTypesResponseSchema.parse(response);

          return {
            data: response.data.map((resourceType: ResourceTypeType) =>
              deserializeResourceType(resourceType),
            ),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getResourceType(
    id: string,
  ): Observable<ResourceTypeResponseType | ErrorResponseType> {
    return this.http
      .get<ResourceTypeResponseType>(
        `${environment.apiUrl}/resource_types/${id}`,
      )
      .pipe(
        map((response: ResourceTypeResponseType) => {
          const resourceTypeResponse =
            ResourceTypeResponseSchema.parse(response);
          return { data: deserializeResourceType(resourceTypeResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  update(
    resourceType: ResourceTypeUpdateType,
  ): Observable<ResourceTypeResponseType | ErrorResponseType> {
    return this.http
      .patch<ResourceTypeResponseType>(
        `${environment.apiUrl}/resource_types/${resourceType.id}`,
        resourceType,
      )
      .pipe(
        map((response: ResourceTypeResponseType) => {
          const parsedResponse = ResourceTypeResponseSchema.parse(response);
          return { data: deserializeResourceType(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  create(
    resourceType: ResourceTypeType,
  ): Observable<ResourceTypeResponseType | ErrorResponseType> {
    return this.http
      .post<ResourceTypeResponseType>(
        `${environment.apiUrl}/resource_types`,
        resourceType,
      )
      .pipe(
        map((response: ResourceTypeResponseType) => {
          const parsedResponse = ResourceTypeResponseSchema.parse(response);
          return { data: deserializeResourceType(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  delete(
    resourceTypeId: string,
  ): Observable<ResourceTypeResponseType | ErrorResponseType> {
    return this.http
      .delete<ResourceTypeResponseType>(
        `${environment.apiUrl}/resource_types/${resourceTypeId}`,
      )
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
