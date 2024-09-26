import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { ErrorResponseType } from '@shared/schemas/error.schema';
import {
  deserializeEventType,
  EventTypeResponseSchema,
  EventTypeResponseType,
  EventTypesResponseSchema,
  EventTypesResponseType,
  EventTypeUpdateType,
} from '@shared/schemas/event-type.schema';
import { EventTypeType } from '@app/shared/schemas/event-type.schema';
import { defaultErrorResponseHandler } from '@shared/helpers/response-format.helper';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventTypeService {
  private http: HttpClient = inject(HttpClient);

  getEventTypes(
    limit?: number,
    offset?: number,
    sort?: string,
    order?: string,
  ): Observable<EventTypesResponseType[] | ErrorResponseType> {
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
      .get<EventTypesResponseType>(`${environment.apiUrl}/event_types`, {
        params,
      })
      .pipe(
        map((response: EventTypesResponseType) => {
          EventTypesResponseSchema.parse(response);

          return {
            data: response.data.map((eventType: EventTypeType) =>
              deserializeEventType(eventType),
            ),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getEventType(
    id: string,
  ): Observable<EventTypeResponseType | ErrorResponseType> {
    return this.http
      .get<EventTypeResponseType>(`${environment.apiUrl}/event_types/${id}`)
      .pipe(
        map((response: EventTypeResponseType) => {
          const eventTypeResponse = EventTypeResponseSchema.parse(response);
          return { data: deserializeEventType(eventTypeResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  update(
    eventType: EventTypeUpdateType,
  ): Observable<EventTypeResponseType | ErrorResponseType> {
    return this.http
      .patch<EventTypeResponseType>(
        `${environment.apiUrl}/event_types/${eventType.id}`,
        eventType,
      )
      .pipe(
        map((response: EventTypeResponseType) => {
          const parsedResponse = EventTypeResponseSchema.parse(response);
          return { data: deserializeEventType(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  create(
    eventType: EventTypeType,
  ): Observable<EventTypeResponseType | ErrorResponseType> {
    return this.http
      .post<EventTypeResponseType>(
        `${environment.apiUrl}/event_types`,
        eventType,
      )
      .pipe(
        map((response: EventTypeResponseType) => {
          const parsedResponse = EventTypeResponseSchema.parse(response);
          return { data: deserializeEventType(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  delete(
    eventTypeId: string,
  ): Observable<EventTypeResponseType | ErrorResponseType> {
    return this.http
      .delete<EventTypeResponseType>(
        `${environment.apiUrl}/event_types/${eventTypeId}`,
      )
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
