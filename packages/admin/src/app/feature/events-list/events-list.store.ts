import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { FeatureFilter } from '@app/shared/interfaces/feature-filter';
import { ToastLevel } from '@app/shared/models';
import { EventModel } from '@app/shared/models/event.model';
import { EventTypeType } from '@app/shared/schemas/event-type.schema';
import { EventTypeService } from '@app/shared/services/event-type.service';
import { EventService } from '@app/shared/services/event.service';
import { ToastService } from '@app/shared/services/toast.service';
import {
  setErrors,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@app/shared/store/request-status.feature';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom, forkJoin } from 'rxjs';

interface EventsListState {
  events: EventModel[];
  eventTypes: EventTypeType[];
  limit: number;
  offset: number;
  totalData: number;
  pageIndex: number;
  sort: string;
  order: SortDirection;
  typeKey: string;
  filters: FeatureFilter[];
}

const initialState: EventsListState = {
  events: [],
  eventTypes: [],
  limit: 10,
  offset: 0,
  totalData: 0,
  pageIndex: 0,
  sort: 'startedAt',
  order: 'asc',
  typeKey: '',
  filters: [],
};

export const EventsListStore = signalStore(
  withDevtools('events'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      eventService = inject(EventService),
      eventTypeService = inject(EventTypeService),
      toastService = inject(ToastService),
    ) => ({
      async load(props: {
        limit: number;
        offset: number;
        sort?: string;
        order?: SortDirection;
        pageIndex?: number;
        typeKey?: string;
        filters?: FeatureFilter[];
      }) {
        patchState(
          store,
          {
            ...initialState,
            ...props,
          },
          setPending(),
        );
        const { eventsResp, eventTypesResp } = await firstValueFrom(
          forkJoin({
            eventsResp: eventService.getEvents(props),
            eventTypesResp: eventTypeService.getEventTypes({}),
          }),
        );

        if (eventsResp.errors) {
          patchState(store, setErrors(eventsResp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Events', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (eventTypesResp.errors) {
          patchState(store, setErrors(eventTypesResp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Event Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              events: eventsResp.data,
              totalData: eventsResp.meta.count,
              eventTypes: eventTypesResp.data,
            },
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
            filters: store.filters(),
          }),
        );

        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Events', 'Fetching', false),
            ToastLevel.ERROR,
          );
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

          toastService.sendMessage(
            toastService.createCrudMessage('Events Count', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { totalData: resp.data.count }, setFulfilled());
        }
      },
    }),
  ),
);
