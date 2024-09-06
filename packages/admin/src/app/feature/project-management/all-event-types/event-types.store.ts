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

interface EventTypesState {
  eventTypes: EventTypeModel[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
}

const initialState: EventTypesState = {
  eventTypes: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
};

export const EventTypesStore = signalStore(
  withDevtools('eventTypes'),
  withState(initialState),
  withRequestStatus(),
  withMethods((store, eventTypesService = inject(EventTypeService)) => ({
    async load(limit: number, offset: number) {
      patchState(store, setPending());
      const resp = await firstValueFrom(
        eventTypesService.getEventTypes(limit, offset),
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
