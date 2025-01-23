import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { ErrorResponseType } from '../schemas/error.schema';
import {
  deserializeFile,
  FileResponseSchema,
  FileResponseType,
  FilesCountType,
  FilesResponseType,
  FileType,
} from '../schemas/file.schema';
import { environment } from '../../../environments/environment';
import { defaultErrorResponseHandler } from '../helpers/response-format.helper';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private http: HttpClient = inject(HttpClient);

  getFiles(props: {
    limit?: number;
    offset?: number;
    sort?: string;
    order?: string;
    typeKey?: string;
  }): Observable<FilesResponseType[] | ErrorResponseType> {
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
    if (props.sort && props.order) {
      params = params.set('sort', props.sort);
      params = params.set('order', props.order);
    }

    return this.http
      .get<FilesResponseType>(`${environment.apiUrl}/files`, { params })
      .pipe(
        map((response: FilesResponseType) => {
          FileResponseSchema.parse(response);

          return {
            data: response.data.map((file: FileType) => file),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getFile(id: string): Observable<FileResponseType | ErrorResponseType> {
    return this.http
      .get<FileResponseType>(`${environment.apiUrl}/files/${id}`)
      .pipe(
        map((response: FileResponseType) => {
          const parsedResponse = FileResponseSchema.parse(response);
          return { data: deserializeFile(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  count(): Observable<FilesCountType | ErrorResponseType> {
    return this.http
      .get<FilesCountType>(`${environment.apiUrl}/files/count`)
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
