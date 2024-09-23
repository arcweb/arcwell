import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  deserializeTag,
  TagsResponseSchema,
  TagsResponseType,
  TagsSimpleResponseSchema,
  TagsSimpleResponseType,
  TagType,
} from '@schemas/tag.schema';
import { ErrorResponseType } from '@schemas/error.schema';
import { catchError } from 'rxjs/operators';
import { defaultErrorResponseHandler } from '@shared/helpers/response-format.helper';

const apiUrl = 'http://localhost:3333';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private http: HttpClient = inject(HttpClient);

  getTags(
    limit?: number,
    offset?: number,
    search?: string,
  ): Observable<TagsResponseType[] | ErrorResponseType> {
    let params = new HttpParams();

    if (search) {
      params = params.set('search', search);
    }
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    if (offset) {
      params = params.set('offset', offset.toString());
    }

    return this.http.get<TagsResponseType>(`${apiUrl}/tags`, { params }).pipe(
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

  getTagsSimple(
    search?: string,
    limit?: number,
    offset?: number,
  ): Observable<TagsResponseType[] | ErrorResponseType> {
    let params = new HttpParams();

    if (search) {
      params = params.set('search', search);
    }
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    if (offset) {
      params = params.set('offset', offset.toString());
    }

    return this.http
      .get<TagsSimpleResponseType>(`${apiUrl}/tags/simple`, { params })
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
      .post<void>(`${apiUrl}/tags/${objectId}/set`, { objectType, tags })
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getTag(id: string): Observable<TagType | ErrorResponseType> {
    return this.http.get<TagType>(`${apiUrl}/tags/${id}`).pipe(
      map((response: TagType) => {
        return deserializeTag(response.data);
      }),
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  create(tag: TagType): Observable<TagType | ErrorResponseType> {
    return this.http.post<TagType>(`${apiUrl}/tags`, tag).pipe(
      map((response: TagType) => {
        return deserializeTag(response);
      }),
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  update(tag: TagType): Observable<TagType | ErrorResponseType> {
    return this.http.put<TagType>(`${apiUrl}/tags/${tag.id}`, tag).pipe(
      map((response: TagType) => {
        return deserializeTag(response);
      }),
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  delete(id: string): Observable<void | ErrorResponseType> {
    return this.http.delete<void>(`${apiUrl}/tags/${id}`).pipe(
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }
}
