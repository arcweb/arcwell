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
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';
import { PersonTypeType } from '@app/shared/schemas/person-type.schema';
import { ResourceTypeType } from '@app/shared/schemas/resource-type.schema';
import { PersonTypeService } from '@app/shared/services/person-type.service';
import { ResourceTypeService } from '@app/shared/services/resource-type.service';
import { RefreshService } from '@app/shared/services/refresh.service';
import { DetailStore } from '@feature/detail/detail.store';
import { DimensionType } from '@schemas/dimension.schema';
import { convertDimensionDataTypeValues } from '@shared/helpers/dimension.helper';

interface EventState {
  event: EventType | null;
  dimensionsCopy: DimensionType[] | [];
  eventTypes: EventTypeType[];
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
  personTypes: PersonTypeType[];
  resourceTypes: ResourceTypeType[];
}

const initialState: EventState = {
  event: null,
  dimensionsCopy: [],
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
      detailStore = inject(DetailStore),
      refreshService = inject(RefreshService),
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

          toastService.sendMessage(
            toastService.createCrudMessage('Event', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (eventTypesResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(eventTypesResponse.errors),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Event Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (personTypesResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(personTypesResponse.errors),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Person Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (resourceTypesResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(resourceTypesResponse.errors),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Resource Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          const dimensionsCopy = eventResponse.data.dimensions?.slice() ?? [];
          patchState(
            store,
            {
              event: eventResponse.data,
              dimensionsCopy: dimensionsCopy,
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

          toastService.sendMessage(
            toastService.createCrudMessage('Event Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (personTypesResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(personTypesResponse.errors),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Person Types', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else if (resourceTypesResponse.errors) {
          patchState(
            store,
            { isReady: true },
            setErrors(resourceTypesResponse.errors),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Resource Types', 'Fetching', false),
            ToastLevel.ERROR,
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

        const newEvent = convertDimensionDataTypeValues(
          updateEventFormData,
          'eventType',
        );

        const resp = await firstValueFrom(eventService.update(newEvent));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Event', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { event: resp.data, inEditMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Event', 'Updated'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
        }
      },
      async create(createEventFormData: EventType) {
        patchState(store, setPending());
        createEventFormData.typeKey = createEventFormData.eventType.key;

        const newEvent = convertDimensionDataTypeValues(
          createEventFormData,
          'eventType',
        );

        const resp = await firstValueFrom(eventService.create(newEvent));
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Event', 'Creating', false),
            ToastLevel.ERROR,
          );
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

          toastService.sendMessage(
            toastService.createCrudMessage('Event', 'Created'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
          // navigate to the new item
          detailStore.routeToNewDetailId(resp.data.id);
        }
      },
      async delete() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          eventService.delete(store.event().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Event', 'Deleting', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, { inEditMode: false }, setFulfilled());

          toastService.sendMessage(
            toastService.createCrudMessage('Event', 'Deleted'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
          // clear the detail_id to close the drawer
          detailStore.clearDetailId();
        }
      },
      async setDimensions(index: number, dimension: DimensionType) {
        const newDimensions = store.dimensionsCopy().slice();

        if (index === -1) {
          newDimensions.push(dimension);
        } else {
          newDimensions[index] = dimension;
        }
        patchState(store, {
          dimensionsCopy: newDimensions,
        });
      },
      async resetDimensions() {
        const newDimensions = store.event().dimensions.slice();
        patchState(store, {
          dimensionsCopy: newDimensions,
        });
      },
      async deleteDimensionSchema(indexToRemove: number) {
        const dimensions = store.dimensionsCopy().slice();

        const newDimensions = dimensions.filter(
          (_: DimensionType, i: number) => i !== indexToRemove,
        );

        patchState(store, {
          dimensionsCopy: newDimensions,
        });
      },
      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.event().id, 'events', tags),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Tags', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(store, setFulfilled());

          toastService.sendMessage(
            toastService.createCrudMessage('Tags', 'Updated'),
            ToastLevel.SUCCESS,
          );

          // refresh the list
          refreshService.triggerRefresh();
        }
      },
    }),
  ),
  withComputed(({ event }) => ({
    tagStrings: computed(() => event()?.tags?.map((tag: string) => tag) ?? []),
  })),
);
