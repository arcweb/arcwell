import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  deserializeTag,
  TagsCountType,
  TagsResponseSchema,
  TagsResponseType,
  TagsSimpleResponseSchema,
  TagsSimpleResponseType,
  TagType,
} from '@schemas/tag.schema';
import { ErrorResponseType } from '@schemas/error.schema';
import { catchError } from 'rxjs/operators';
import { defaultErrorResponseHandler } from '@shared/helpers/response-format.helper';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private http: HttpClient = inject(HttpClient);

  getTags(props: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Observable<TagsResponseType[] | ErrorResponseType> {
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
      .get<TagsResponseType>(`${environment.apiUrl}/tags`, { params })
      .pipe(
        map((response: TagsResponseType) => {
          TagsResponseSchema.parse(response);

          return {
            data: response.data.map((tag: TagType) => deserializeTag(tag)),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getTagsSimple(props: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Observable<TagsResponseType[] | ErrorResponseType> {
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
      .get<TagsSimpleResponseType>(`${environment.apiUrl}/tags/simple`, {
        params,
      })
      .pipe(
        map((response: TagsSimpleResponseType) => {
          TagsSimpleResponseSchema.parse(response);

          return {
            data: response.data,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  setTags(
    objectId: string,
    objectType: string,
    tags: string[],
  ): Observable<void | ErrorResponseType> {
    return this.http
      .post<void>(`${environment.apiUrl}/tags/${objectId}/set`, {
        objectType,
        tags,
      })
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getTag(id: string): Observable<TagType | ErrorResponseType> {
    return this.http.get<TagType>(`${environment.apiUrl}/tags/${id}`).pipe(
      map((response: TagType) => {
        return deserializeTag(response.data);
      }),
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  getTagWithRelated(props: {
    id: string;
    objectType: string;
    limit?: number;
    offset?: number;
    sort?: string;
    order?: string;
  }): Observable<TagType | ErrorResponseType> {
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
      .get<TagType>(
        `${environment.apiUrl}/tags/${props.id}/${props.objectType}`,
        {
          params,
        },
      )
      .pipe(
        map((response: TagType) => {
          return deserializeTag(response.data);
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  create(tag: TagType): Observable<TagType | ErrorResponseType> {
    return this.http.post<TagType>(`${environment.apiUrl}/tags`, tag).pipe(
      map((response: TagType) => {
        return deserializeTag(response.data);
      }),
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  update(tag: TagType): Observable<TagType | ErrorResponseType> {
    return this.http
      .patch<TagType>(`${environment.apiUrl}/tags/${tag.id}`, tag)
      .pipe(
        map((response: TagType) => {
          return deserializeTag(response.data);
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  delete(id: string): Observable<void | ErrorResponseType> {
    return this.http.delete<void>(`${environment.apiUrl}/tags/${id}`).pipe(
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  count(): Observable<TagsCountType | ErrorResponseType> {
    return this.http
      .get<TagsCountType>(`${environment.apiUrl}/tags/count`)
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
