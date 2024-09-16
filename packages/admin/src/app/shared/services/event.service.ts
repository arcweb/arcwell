import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { ErrorResponseType } from '@shared/schemas/error.schema';
import {
  deserializeEvent,
  EventResponseSchema,
  EventResponseType,
  EventsResponseSchema,
  EventsResponseType,
  EventUpdateType,
} from '@shared/schemas/event.schema';
import { EventType } from '@app/shared/schemas/event.schema';
import { defaultErrorResponseHandler } from '@shared/helpers/response-format.helper';

const apiUrl = 'http://localhost:3333';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private http: HttpClient = inject(HttpClient);

  getEvents(
    limit?: number,
    offset?: number,
    sort?: string,
    order?: string,
    typeKey?: string,
  ): Observable<EventsResponseType[] | ErrorResponseType> {
    let params = new HttpParams();

    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    if (offset !== undefined) {
      params = params.set('offset', offset.toString());
    }
    if (typeKey) {
      params = params.set('typeKey', typeKey);
    }
    if (sort && order) {
      params = params.set('sort', sort);
      params = params.set('order', order);
    }

    return this.http
      .get<EventsResponseType>(`${apiUrl}/events`, { params })
      .pipe(
        map((response: EventsResponseType) => {
          EventsResponseSchema.parse(response);

          return {
            data: response.data.map((event: EventType) =>
              deserializeEvent(event),
            ),
            meta: response.meta,
          };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  getEvent(id: string): Observable<EventResponseType | ErrorResponseType> {
    return this.http.get<EventResponseType>(`${apiUrl}/events/${id}`).pipe(
      map((response: EventResponseType) => {
        const eventResponse = EventResponseSchema.parse(response);
        return { data: deserializeEvent(eventResponse.data) };
      }),
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  update(
    event: EventUpdateType,
  ): Observable<EventResponseType | ErrorResponseType> {
    return this.http
      .patch<EventResponseType>(`${apiUrl}/events/${event.id}`, event)
      .pipe(
        map((response: EventResponseType) => {
          const parsedResponse = EventResponseSchema.parse(response);
          return { data: deserializeEvent(parsedResponse.data) };
        }),
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }

  create(event: EventType): Observable<EventResponseType | ErrorResponseType> {
    return this.http.post<EventResponseType>(`${apiUrl}/events`, event).pipe(
      map((response: EventResponseType) => {
        const parsedResponse = EventResponseSchema.parse(response);
        return { data: deserializeEvent(parsedResponse.data) };
      }),
      catchError(error => {
        return defaultErrorResponseHandler(error);
      }),
    );
  }

  delete(eventId: string): Observable<EventResponseType | ErrorResponseType> {
    return this.http
      .delete<EventResponseType>(`${apiUrl}/events/${eventId}`)
      .pipe(
        catchError(error => {
          return defaultErrorResponseHandler(error);
        }),
      );
  }
}
