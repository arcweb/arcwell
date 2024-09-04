import { EventType, EventUpdateType } from '@app/shared/schemas/event.schema';
import { EventTypeType } from '@app/shared/schemas/event-type.schema';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  setErrors,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@app/shared/store/request-status.feature';
import { inject } from '@angular/core';
import { EventService } from '@app/shared/services/event.service';
import { EventTypeService } from '@app/shared/services/event-type.service';
import { firstValueFrom, forkJoin } from 'rxjs';

interface EventState {
  event: EventType | null;
  eventTypes: EventTypeType[];
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: EventState = {
  event: null,
  eventTypes: [],
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
};

export const EventStore = signalStore(
  withDevtools('event'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      eventService = inject(EventService),
      eventTypeService = inject(EventTypeService),
    ) => ({
      async initialize(eventId: string) {
        patchState(store, setPending());
        const { eventResponse, eventTypesResponse } = await firstValueFrom(
          forkJoin({
            eventResponse: eventService.getEvent(eventId),
            eventTypesResponse: eventTypeService.getEventTypes(),
          }),
        );
        if (eventResponse.errors) {
          patchState(store, { isReady: true }, setErrors(eventResponse.errors));
        } else if (eventTypesResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(eventTypesResponse.errors),
          );
        } else {
          patchState(
            store,
            { event: eventResponse.data, eventTypes: eventTypesResponse.data },
            setFulfilled(),
          );
        }
      },
      async initializeForCreate() {
        patchState(store, setPending());
        const eventTypesResp = await firstValueFrom(
          eventTypeService.getEventTypes(),
        );
        if (eventTypesResp.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(eventTypesResp.errors),
          );
        } else {
          patchState(
            store,
            {
              eventTypes: eventTypesResp.data,
              inCreateMode: true,
              inEditMode: true,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async toggleEditMode() {
        patchState(store, { inEditMode: !store.inEditMode() });
      },
      async update(updateEventFormData: EventUpdateType) {
        patchState(store, setPending());
        updateEventFormData.id = store.event().id;
        if (updateEventFormData.eventType && updateEventFormData.eventType.id) {
          updateEventFormData.typeKey = updateEventFormData.eventType.key;
        }
        const resp = await firstValueFrom(
          eventService.update(updateEventFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(
            store,
            { event: resp.data, inEditMode: false },
            setFulfilled(),
          );
        }
      },
      async create(createEventFormData: EventType) {
        patchState(store, setPending());
        createEventFormData.typeKey = createEventFormData.eventType.key;

        const resp = await firstValueFrom(
          eventService.create(createEventFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(
            store,
            { event: resp.data, inEditMode: false },
            setFulfilled(),
          );
        }
      },
      async delete() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          eventService.delete(store.event().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, { inEditMode: false }, setFulfilled());
        }
      },
    }),
  ),
);
