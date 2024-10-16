import {
  patchState,
  signalStore,
  withComputed,
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
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EventType, EventUpdateType } from '@shared/schemas/event.schema';
import { EventTypeService } from '@shared/services/event-type.service';
import { TagService } from '@shared/services/tag.service';
import { FeatureStore } from '@app/shared/store/feature.store';
import { ToastService } from '@app/shared/services/toast.service';
import { ToastLevel } from '@app/shared/models';
import { DetailStore } from '../detail/detail.store';
import { RefreshService } from '@app/shared/services/refresh.service';

interface EventTypeState {
  eventType: EventType | null;
  inEditMode: boolean;
  inCreateMode: boolean;
  isReady: boolean;
}

const initialState: EventTypeState = {
  eventType: null,
  inEditMode: false,
  inCreateMode: false,
  isReady: false,
};

export const EventTypeStore = signalStore(
  withDevtools('eventType'),
  withState(initialState),
  withRequestStatus(),
  withMethods(
    (
      store,
      eventTypeService = inject(EventTypeService),
      tagService = inject(TagService),
      featureStore = inject(FeatureStore),
      toastService = inject(ToastService),
      detailStore = inject(DetailStore),
      refreshService = inject(RefreshService),
    ) => ({
      async initialize(eventTypeId: string) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          eventTypeService.getEventType(eventTypeId),
        );
        if (resp.errors) {
          patchState(store, { isReady: true }, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Event Type', 'Fetching', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            {
              eventType: resp.data,
              isReady: true,
            },
            setFulfilled(),
          );
        }
      },
      async initializeForCreate() {
        patchState(
          store,
          {
            inCreateMode: true,
            inEditMode: true,
            isReady: true,
          },
          setFulfilled(),
        );
      },
      async toggleEditMode() {
        patchState(store, { inEditMode: !store.inEditMode() });
      },
      async update(updateEventFormData: EventUpdateType) {
        patchState(store, setPending());
        updateEventFormData.id = store.eventType().id;
        if (updateEventFormData.eventType && updateEventFormData.eventType.id) {
          updateEventFormData.eventTypeId = updateEventFormData.eventType.id;
        }
        const resp = await firstValueFrom(
          eventTypeService.update(updateEventFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Event Type', 'Updating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { eventType: resp.data, inEditMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Event Type', 'Updated'),
            ToastLevel.SUCCESS,
          );

          // load the feature list with the latest list of subfeatures
          featureStore.load();
          // refresh the list
          refreshService.triggerRefresh();
        }
      },
      async create(createEventTypeFormData: EventType) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          eventTypeService.create(createEventTypeFormData),
        );
        if (resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Event Type', 'Creating', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { eventType: resp.data, inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Event Type', 'Created'),
            ToastLevel.SUCCESS,
          );

          // load the feature list with the latest list of subfeatures
          featureStore.load();
          // refresh the list
          refreshService.triggerRefresh();
          // navigate the user to the newly created item
          detailStore.routeToNewDetailId(resp.data.id);
        }
      },
      async delete() {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          eventTypeService.delete(store.eventType().id),
        );
        if (resp && resp.errors) {
          patchState(store, setErrors(resp.errors));

          toastService.sendMessage(
            toastService.createCrudMessage('Event Type', 'Deleting', false),
            ToastLevel.ERROR,
          );
        } else {
          patchState(
            store,
            { inEditMode: false, inCreateMode: false },
            setFulfilled(),
          );

          toastService.sendMessage(
            toastService.createCrudMessage('Event Type', 'Deleted'),
            ToastLevel.SUCCESS,
          );

          // load the feature list with the latest list of subfeatures
          featureStore.load();
          // refresh the list
          refreshService.triggerRefresh();
          // clear the detail_id to close the drawer
          detailStore.clearDetailId();
        }
      },
      async setTags(tags: string[]) {
        patchState(store, setPending());
        const resp = await firstValueFrom(
          tagService.setTags(store.eventType().id, 'event_types', tags),
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
  withComputed(({ eventType }) => ({
    tagStrings: computed(
      () => eventType()?.tags?.map((tag: string) => tag) ?? [],
    ),
  })),
);
