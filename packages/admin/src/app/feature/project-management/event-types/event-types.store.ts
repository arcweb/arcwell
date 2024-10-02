import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  withRequestStatus,
  setPending,
  setFulfilled,
  setErrors,
} from '@shared/store/request-status.feature';

import { EventTypeService } from '@shared/services/event-type.service';
import { inject } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { EventTypeModel } from '@app/shared/models/event-type.model';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';

interface EventTypesState {
  eventTypes: EventTypeModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
}

const initialState: EventTypesState = {
  eventTypes: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sort: 'key',
  order: 'asc',
};

export const EventTypesStore = signalStore(
  withDevtools('eventTypes'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, eventTypesService = inject(EventTypeService)) => ({
    async load(
      limit: number,
      offset: number,
      sort = '',
      order: SortDirection = 'asc',
      pageIndex = 0,
    ) {
      patchState(
        store,
        {
          ...initialState,
          sort: sort,
          order: order,
          pageIndex: pageIndex,
        },
        setPending(),
      );
      const resp = await firstValueFrom(
        eventTypesService.getEventTypes({
          limit: limit,
          offset: offset,
          sort: sort,
          order: order,
        }),
      );
      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { eventTypes: resp.data, totalData: resp.meta.count },
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
        eventTypesService.getEventTypes({
          limit: store.limit(),
          offset: store.offset(),
        }),
      );

      if (resp.errors) {
        patchState(store, setErrors(resp.errors));
      } else {
        patchState(
          store,
          { eventTypes: resp.data, totalData: resp.meta.count },
          setFulfilled(),
        );
      }
    },
  })),
  withHooks({
    onInit(store) {
      store.load(store.limit(), store.offset());
    },
  }),
);
