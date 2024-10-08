import { EventType, EventUpdateType } from '@app/shared/schemas/event.schema';
import { EventTypeType } from '@app/shared/schemas/event-type.schema';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  setErrors,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@app/shared/store/request-status.feature';
import { computed, inject } from '@angular/core';
import { EventService } from '@app/shared/services/event.service';
import { EventTypeService } from '@app/shared/services/event-type.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { TagService } from '@shared/services/tag.service';
import { TagType } from '@schemas/tag.schema';
import { ToastService } from '@app/shared/services/toast.service';
import { Router } from '@angular/router';
import { ToastLevel } from '@app/shared/models';
import { PersonTypeType } from '@app/shared/schemas/person-type.schema';
import { ResourceTypeType } from '@app/shared/schemas/resource-type.schema';
import { PersonTypeService } from '@app/shared/services/person-type.service';
import { ResourceTypeService } from '@app/shared/services/resource-type.service';

interface EventState {
  event: EventType | null;
  eventTypes: EventTypeType[];
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
  personTypes: PersonTypeType[];
  resourceTypes: ResourceTypeType[];
}

const initialState: EventState = {
  event: null,
  eventTypes: [],
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
  personTypes: [],
  resourceTypes: [],
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
      personTypeService = inject(PersonTypeService),
      resourceTypeService = inject(ResourceTypeService),
      tagService = inject(TagService),
      toastService = inject(ToastService),
      router = inject(Router),
    ) => ({
      async initialize(eventId: string) {
        patchState(store, setPending());
        const {
          eventResponse,
          eventTypesResponse,
          personTypesResponse,
          resourceTypesResponse,
        } = await firstValueFrom(
          forkJoin({
            eventResponse: eventService.getEvent(eventId),
            eventTypesResponse: eventTypeService.getEventTypes({}),
            personTypesResponse: personTypeService.getPersonTypes({}),
            resourceTypesResponse: resourceTypeService.getResourceTypes({}),
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
        } else if (personTypesResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(personTypesResponse.errors),
          );
        } else if (resourceTypesResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(resourceTypesResponse.errors),
          );
        } else {
          patchState(
            store,
            {
              event: eventResponse.data,
              eventTypes: eventTypesResponse.data,
              personTypes: personTypesResponse.data,
              resourceTypes: resourceTypesResponse.data,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async initializeForCreate() {
        patchState(store, setPending());
        const {
          eventTypesResponse,
          personTypesResponse,
          resourceTypesResponse,
        } = await firstValueFrom(
          forkJoin({
            eventTypesResponse: eventTypeService.getEventTypes({}),
            personTypesResponse: personTypeService.getPersonTypes({}),
            resourceTypesResponse: resourceTypeService.getResourceTypes({}),
          }),
        );
        if (eventTypesResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(eventTypesResponse.errors),
          );
        } else if (personTypesResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(personTypesResponse.errors),
          );
        } else if (resourceTypesResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(resourceTypesResponse.errors),
          );
        } else {
          patchState(
            store,
            {
              eventTypes: eventTypesResponse.data,
              personTypes: personTypesResponse.data,
              resourceTypes: resourceTypesResponse.data,
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
          toastService.sendMessage('Updated Event.', ToastLevel.SUCCESS);
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
            {
              event: resp.data,
              inEditMode: false,
              inCreateMode: false,
            },
            setFulfilled(),
          );

          toastService.sendMessage('Created event.', ToastLevel.SUCCESS);

          // navigate to the new item and dont save the current route in history
          router.navigateByUrl(`/project-management/events/${resp.data.id}`, {
            replaceUrl: true,
          });
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
      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.event().id, 'events', tags),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));
        } else {
          patchState(store, setFulfilled());
        }
      },
    }),
  ),
  withComputed(({ event }) => ({
    tagStrings: computed(
      () => event()?.tags?.map((tag: TagType) => tag.pathname) ?? [],
    ),
  })),
);
