import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { ErrorResponseType } from '../schemas/error.schema';
import {
  deserializeFile,
  FileResponseSchema,
  FileResponseType,
  FilesCountType,
  FilesResponseSchema,
  FilesResponseType,
  FileType,
  FileUpdateType,
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
          FilesResponseSchema.parse(response);

          return {
            data: response.data.map((file: FileType) => deserializeFile(file)),
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

  updateFile(
    file: FileUpdateType,
  ): Observable<FileResponseType | ErrorResponseType> {
    return this.http
      .put<FileResponseType>(`${environment.apiUrl}/files/${file.id}`, file)
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

  uploadFile(
    name: string,
    file: File,
    typeKey: string,
  ): Observable<ErrorResponseType | null> {
    const url = `${environment.apiUrl}/files/upload`;
    const data = new FormData();
    data.append('file', file, file.name);
    data.append('typeKey', typeKey);
    data.append('name', name);
    return this.http.post(url, data).pipe(
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  downloadFile(id: string): Observable<Blob | ErrorResponseType> {
    return this.http.get(`${environment.apiUrl}/files/${id}/download`, {
      responseType: 'blob',
    });
  }

  deleteFile(id: string): Observable<ErrorResponseType | void> {
    return this.http.delete<void>(`${environment.apiUrl}/files/${id}`).pipe(
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }
}
