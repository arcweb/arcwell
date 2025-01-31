import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, map, catchError } from 'rxjs';
import { buildSearchParams } from '../helpers/basic-search.helper';
import { defaultErrorResponseHandler } from '../helpers/response-format.helper';
import { ErrorResponseType } from '../schemas/error.schema';
import {
  FileTypesResponseType,
  FileTypesResponseSchema,
  FileTypeType,
  deserializeFileType,
  FileTypeResponseType,
  FileTypeResponseSchema,
  FileTypeUpdateType,
} from '../schemas/file-type.schema';

@Injectable({
  providedIn: 'root',
})
export class FileTypeService {
  private http: HttpClient = inject(HttpClient);

  getFileTypes(props: {
    limit?: number;
    offset?: number;
    sort?: string;
    order?: string;
    search?: { field: string; searchString: string }[];
  }): Observable<FileTypesResponseType[] | ErrorResponseType> {
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
    if (props.search && props.search.length > 0) {
      params = buildSearchParams(props.search, params);
    }

    return this.http
      .get<FileTypesResponseType>(`${environment.apiUrl}/files/types`, {
        params,
      })
      .pipe(
        map((response: FileTypesResponseType) => {
          FileTypesResponseSchema.parse(response);
          return {
            data: response.data.map((fileType: FileTypeType) =>
              deserializeFileType(fileType),
            ),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getFileType(
    id: string,
  ): Observable<FileTypeResponseType | ErrorResponseType> {
    return this.http
      .get<FileTypeResponseType>(`${environment.apiUrl}/files/types/${id}`)
      .pipe(
        map((response: FileTypeResponseType) => {
          const parsedResponse = FileTypeResponseSchema.parse(response);
          return { data: deserializeFileType(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  update(
    file: FileTypeUpdateType,
  ): Observable<FileTypeResponseType | ErrorResponseType> {
    return this.http
      .patch<FileTypeResponseType>(
        `${environment.apiUrl}/files/types/${file.id}`,
        file,
      )
      .pipe(
        map((response: FileTypeResponseType) => {
          const parsedResponse = FileTypeResponseSchema.parse(response);
          return { data: deserializeFileType(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  create(
    fileType: FileTypeType,
  ): Observable<FileTypeResponseType | ErrorResponseType> {
    return this.http
      .post<FileTypeResponseType>(`${environment.apiUrl}/files/types`, fileType)
      .pipe(
        map((response: FileTypeResponseType) => {
          const parsedResponse = FileTypeResponseSchema.parse(response);
          return { data: deserializeFileType(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  delete(
    fileTypeId: string,
  ): Observable<FileTypeResponseType | ErrorResponseType> {
    return this.http
      .delete<FileTypeResponseType>(
        `${environment.apiUrl}/files/types/${fileTypeId}`,
      )
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
