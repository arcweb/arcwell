import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, map } from 'rxjs';
import { ErrorResponseType } from '@schemas/error.schema';
import {
  deserializeRole,
  RoleResponseSchema,
  RoleResponseType,
  RolesResponseSchema,
  RolesResponseType,
  RoleType,
} from '@schemas/role.schema';
import { defaultErrorResponseHandler } from '../helpers/response-format.helper';
import { RoleModel } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http: HttpClient = inject(HttpClient);

  getAllRoles(
    limit?: number,
    offset?: number,
  ): Observable<RolesResponseType[] | ErrorResponseType> {
    let params = new HttpParams();

    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    if (offset !== undefined) {
      params = params.set('offset', offset.toString());
    }

    return this.http
      .get<RolesResponseType>(`${environment.apiUrl}/roles`, { params })
      .pipe(
        map((response: RolesResponseType) => {
          RolesResponseSchema.parse(response);

          return {
            data: response.data.map((role: RoleType) => deserializeRole(role)),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getRole(id: string): Observable<RoleModel | ErrorResponseType> {
    return this.http
      .get<RoleResponseType>(`${environment.apiUrl}/roles/${id}`)
      .pipe(
        map((response: RoleResponseType) => {
          const parsedResponse = RoleResponseSchema.parse(response);
          return { data: deserializeRole(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
