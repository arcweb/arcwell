import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  deserializeGroup,
  GroupsCountType,
  GroupsResponseSchema,
  GroupsResponseType,
  GroupsSimpleResponseSchema,
  GroupsSimpleResponseType,
  GroupType,
} from '@schemas/group.schema';
import { ErrorResponseType } from '@schemas/error.schema';
import { catchError } from 'rxjs/operators';
import { defaultErrorResponseHandler } from '@shared/helpers/response-format.helper';
import { environment } from '../../../environments/environment';
import { buildSearchParams } from '../helpers/basic-search.helper';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private http: HttpClient = inject(HttpClient);

  getGroups(props: {
    limit?: number;
    offset?: number;
    search?: { field: string; searchString: string }[];
  }): Observable<GroupsResponseType[] | ErrorResponseType> {
    let params = new HttpParams();

    if (props.search && props.search.length > 0) {
      params = buildSearchParams(props.search, params);
    }
    if (props.limit) {
      params = params.set('limit', props.limit.toString());
    }
    if (props.offset) {
      params = params.set('offset', props.offset.toString());
    }

    return this.http
      .get<GroupsResponseType>(`${environment.apiUrl}/groups`, { params })
      .pipe(
        map((response: GroupsResponseType) => {
          GroupsResponseSchema.parse(response);

          return {
            data: response.data.map((group: GroupType) =>
              deserializeGroup(group),
            ),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getGroupsSimple(props: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Observable<GroupsResponseType[] | ErrorResponseType> {
    let params = new HttpParams();

    if (props.search) {
      params = params.set('search', props.search);
    }
    if (props.limit) {
      params = params.set('limit', props.limit.toString());
    }
    if (props.offset) {
      params = params.set('offset', props.offset.toString());
    }

    return this.http
      .get<GroupsSimpleResponseType>(`${environment.apiUrl}/groups/simple`, {
        params,
      })
      .pipe(
        map((response: GroupsSimpleResponseType) => {
          GroupsSimpleResponseSchema.parse(response);

          return {
            data: response.data,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  setGroups(
    objectId: string,
    objectType: string,
    groups: string[],
  ): Observable<void | ErrorResponseType> {
    return this.http
      .post<void>(`${environment.apiUrl}/groups/${objectId}/set`, {
        objectType,
        groups,
      })
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getGroup(id: string): Observable<GroupType | ErrorResponseType> {
    return this.http.get<GroupType>(`${environment.apiUrl}/groups/${id}`).pipe(
      map((response: GroupType) => {
        return deserializeGroup(response.data);
      }),
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  getGroupWithRelated(props: {
    id: string;
    objectType: string;
    limit?: number;
    offset?: number;
    sort?: string;
    order?: string;
  }): Observable<GroupType | ErrorResponseType> {
    let params = new HttpParams();

    if (props.limit !== undefined) {
      params = params.set('limit', props.limit.toString());
    }
    if (props.offset !== undefined) {
      params = params.set('offset', props.offset.toString());
    }
    if (props.sort && props.order) {
      params = params.set('sort', props.sort);
      params = params.set('order', props.order);
    }

    return this.http
      .get<GroupType>(
        `${environment.apiUrl}/groups/${props.id}/${props.objectType}`,
        {
          params,
        },
      )
      .pipe(
        map((response: GroupType) => {
          return deserializeGroup(response.data);
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  create(group: GroupType): Observable<GroupType | ErrorResponseType> {
    return this.http
      .post<GroupType>(`${environment.apiUrl}/groups`, group)
      .pipe(
        map((response: GroupType) => {
          return deserializeGroup(response.data);
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  update(group: GroupType): Observable<GroupType | ErrorResponseType> {
    return this.http
      .patch<GroupType>(`${environment.apiUrl}/groups/${group.id}`, group)
      .pipe(
        map((response: GroupType) => {
          return deserializeGroup(response.data);
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  delete(id: string): Observable<void | ErrorResponseType> {
    return this.http.delete<void>(`${environment.apiUrl}/groups/${id}`).pipe(
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  count(): Observable<GroupsCountType | ErrorResponseType> {
    return this.http
      .get<GroupsCountType>(`${environment.apiUrl}/groups/count`)
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
