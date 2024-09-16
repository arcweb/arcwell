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
  sortColumn: string;
  sortDirection: SortDirection;
}

const initialState: EventTypesState = {
  eventTypes: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sortColumn: 'key',
  sortDirection: 'asc',
};

export const EventTypesStore = signalStore(
  withDevtools('eventTypes'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, eventTypesService = inject(EventTypeService)) => ({
    async load(
      limit: number,
      offset: number,
      sortColumn = '',
      sortDirection: SortDirection = 'asc',
    ) {
      patchState(
        store,
        {
          ...initialState,
          sortColumn: sortColumn,
          sortDirection: sortDirection,
        },
        setPending(),
      );
      const resp = await firstValueFrom(
        eventTypesService.getEventTypes(
          limit,
          offset,
          sortColumn,
          sortDirection,
        ),
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
        eventTypesService.getEventTypes(store.limit(), store.offset()),
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
