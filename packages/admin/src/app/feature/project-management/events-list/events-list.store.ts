import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { EventType } from '@app/shared/schemas/event.schema';
import { EventService } from '@app/shared/services/event.service';
import {
  setErrors,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@app/shared/store/request-status.feature';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

interface EventsListState {
  events: EventType[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
  typeKey: string;
}

const initialState: EventsListState = {
  events: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sort: 'name',
  order: 'asc',
  typeKey: '',
};

export const EventsListStore = signalStore(
  withDevtools('events'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, eventService = inject(EventService)) => ({
    async load(
      limit: number,
      offset: number,
      sort = '',
      order: SortDirection = 'asc',
      typeKey = '',
    ) {
      patchState(
        store,
        {
          ...initialState,
          sort: sort,
          order: order,
          typeKey: typeKey,
        },
        setPending(),
      );
      const resp = await firstValueFrom(
        eventService.getEvents(limit, offset, sort, order, typeKey),
      );
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { events: resp.data, totalData: resp.meta.count },
          setFulfilled(),
        );
      }
    },
    async loadPage(event: PageEvent) {
      const newOffset = event.pageIndex * event.pageSize;
      patchState(
        store,
        {
          offset: newOffset,
          pageIndex: event.pageIndex,
          limit: event.pageSize,
        },
        setPending(),
      );
      const resp = await firstValueFrom(
        eventService.getEvents(store.limit(), store.offset(), store.typeKey()),
      );

      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { events: resp.data, totalData: resp.meta.count },
          setFulfilled(),
        );
      }
    },
  })),
);
