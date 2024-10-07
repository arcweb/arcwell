import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { EventModel } from '@app/shared/models/event.model';
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
  events: EventModel[];
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
    async load(props: {
      limit: number;
      offset: number;
      sort?: string;
      order?: SortDirection;
      pageIndex?: number;
      typeKey?: string;
    }) {
      patchState(
        store,
        {
          ...initialState,
          ...props,
        },
        setPending(),
      );
      const resp = await firstValueFrom(eventService.getEvents(props));
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
        eventService.getEvents({
          limit: store.limit(),
          offset: store.offset(),
          sort: store.sort(),
          order: store.order(),
          typeKey: store.typeKey(),
        }),
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
    async count() {
      patchState(store, setPending());
      const resp = await firstValueFrom(eventService.count());
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(store, { totalData: resp.data.count }, setFulfilled());
      }
    },
  })),
);
