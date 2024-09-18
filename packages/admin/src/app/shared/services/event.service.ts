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

  getEvents(props: {
    limit?: number;
    offset?: number;
    sort?: string;
    order?: string;
    typeKey?: string;
    search?: [{ field: string; searchString: string }];
  }): Observable<EventsResponseType[] | ErrorResponseType> {
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

    if (props.search && props.search.length > 0) {
      props.search.forEach(searchItem => {
        if (searchItem.field && searchItem.searchString) {
          // Format: search[field]=searchString
          params = params.set(
            `search[${searchItem.field}]`,
            searchItem.searchString,
          );
        }
      });
    }
    if (props.sort && props.order) {
      params = params.set('sort', props.sort);
      params = params.set('order', props.order);
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
